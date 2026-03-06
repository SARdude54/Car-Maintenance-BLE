/**
  ******************************************************************************
  * @file    app_bluenrg_ms.c
  * @author  SRA Application Team
  * @brief   BlueNRG-M0 initialization and applicative code
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2025 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */

/* Includes ------------------------------------------------------------------*/
#include "app_bluenrg_ms.h"

#include "hci.h"
#include "hci_le.h"
#include "hci_tl.h"
#include "link_layer.h"
#include "sensor.h"
#include "gatt_db.h"

#include "compiler.h"
#include "bluenrg_utils.h"
#include "stm32l4xx_nucleo.h"
#include "bluenrg_gap.h"
#include "bluenrg_gap_aci.h"
#include "bluenrg_gatt_aci.h"
#include "bluenrg_hal_aci.h"
#include "sm.h"
#include "stm32l4xx_hal_tim.h"

/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* Private defines -----------------------------------------------------------*/
#define USE_BUTTON 0

/* Private variables ---------------------------------------------------------*/
extern volatile uint8_t set_connectable;
extern volatile int     connected;

/* at startup, suppose the X-NUCLEO-IDB04A1 is used */
uint8_t bnrg_expansion_board = IDB04A1;
uint8_t bdaddr[BDADDR_SIZE];

static volatile uint8_t user_button_init_state = 1;
static volatile uint8_t user_button_pressed = 0;

/* Private function prototypes -----------------------------------------------*/
static void User_Process(void);
static void User_Init(void);

#if PRINT_CSV_FORMAT
extern volatile uint32_t ms_counter;
/**
 * @brief  This function is a utility to print the log time
 *         in the format HH:MM:SS:MSS (DK GUI time format)
 * @param  None
 * @retval None
 */
void print_csv_time(void)
{
  uint32_t ms = HAL_GetTick();
  PRINT_CSV("%02ld:%02ld:%02ld.%03ld",
            (long)(ms/(60*60*1000)%24),
            (long)(ms/(60*1000)%60),
            (long)((ms/1000)%60),
            (long)(ms%1000));
}
#endif

void MX_BlueNRG_MS_Init(void)
{
  const char *name = "EVA";
  uint16_t service_handle, dev_name_char_handle, appearance_char_handle;

  uint8_t  bdaddr_len_out;
  uint8_t  hwVersion;
  uint16_t fwVersion;
  int ret;

  User_Init();

  /* Get the User Button initial state */
  user_button_init_state = BSP_PB_GetState(BUTTON_KEY);

  hci_init(user_notify, NULL);

  /* get the BlueNRG HW and FW versions */
  getBlueNRGVersion(&hwVersion, &fwVersion);

  /*
   * Reset BlueNRG again otherwise we won't
   * be able to change its MAC address.
   * aci_hal_write_config_data() must be the first
   * command after reset otherwise it will fail.
   */
  hci_reset();
  HAL_Delay(100);

  PRINTF("HWver %d\nFWver %d\n", hwVersion, fwVersion);

  if (hwVersion > 0x30) {
    bnrg_expansion_board = IDB05A1;
  }

  ret = aci_hal_read_config_data(CONFIG_DATA_RANDOM_ADDRESS,
                                 BDADDR_SIZE,
                                 &bdaddr_len_out,
                                 bdaddr);
  if (ret) {
    PRINTF("Read Static Random address failed.\n");
  }

  if ((bdaddr[5] & 0xC0) != 0xC0) {
    PRINTF("Static Random address not well formed.\n");
    while (1);
  }

  /* GATT Init */
  ret = aci_gatt_init();
  if (ret) {
    PRINTF("GATT_Init failed.\n");
  }

  /* GAP Init */
  if (bnrg_expansion_board == IDB05A1) {
    ret = aci_gap_init_IDB05A1(GAP_PERIPHERAL_ROLE_IDB05A1,
                               0,
                               0x07,
                               &service_handle,
                               &dev_name_char_handle,
                               &appearance_char_handle);
  } else {
    ret = aci_gap_init_IDB04A1(GAP_PERIPHERAL_ROLE_IDB04A1,
                               &service_handle,
                               &dev_name_char_handle,
                               &appearance_char_handle);
  }

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("GAP_Init failed.\n");
  }

  /* Update device name */
  ret = aci_gatt_update_char_value(service_handle,
                                   dev_name_char_handle,
                                   0,
                                   strlen(name),
                                   (uint8_t *)name);
  if (ret) {
    PRINTF("aci_gatt_update_char_value failed.\n");
    while (1);
  }

  ret = aci_gap_set_auth_requirement(MITM_PROTECTION_REQUIRED,
                                     OOB_AUTH_DATA_ABSENT,
                                     NULL,
                                     7,
                                     16,
                                     USE_FIXED_PIN_FOR_PAIRING,
                                     123456,
                                     BONDING);
  if (ret) {
    PRINTF("aci_gap_set_authentication_requirement failed.\n");
    while (1);
  }

  PRINTF("BLE Stack Initialized\n");

  ret = Add_Diagnostics_Service();
  if (ret == BLE_STATUS_SUCCESS) {
    PRINTF("Diagnostics service added successfully.\n");
  } else {
    PRINTF("Error while adding Diagnostics service: 0x%02x\r\n", ret);
    while (1);
  }

  /* Set output power level */
  ret = aci_hal_set_tx_power_level(1, 4);
  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("aci_hal_set_tx_power_level failed: 0x%02x\r\n", ret);
  }
}

/*
 * BlueNRG-MS background task
 */
void MX_BlueNRG_MS_Process(void)
{
  User_Process();
  hci_user_evt_proc();
}

/**
 * @brief  Initialize User process.
 *
 * @param  None
 * @retval None
 */
static void User_Init(void)
{
  /* Keep middleware-instantiated BSP setup intact */
  BSP_PB_Init(BUTTON_KEY, BUTTON_MODE_EXTI);
  BSP_LED_Init(LED2);
  BSP_COM_Init(COM1);
}

/**
 * @brief  Periodically update BLE characteristics with test data.
 *         Replace these test values later with ring buffer / OBD2 / ML outputs.
 *
 * @param  None
 * @retval None
 */
static void User_Process(void)
{

  // data to be displayed
  static uint32_t counter   = 0;
  static uint32_t runtime_s = 0;
  static uint16_t rpm       = 800;
  static uint16_t speed     = 0;
  static uint32_t distance  = 0;
  static int16_t  vibx      = 10;
  static int16_t  viby      = -5;
  static int16_t  vibz      = 3;
  static uint32_t last_ms   = 0;

  if (set_connectable) {
    Set_DeviceConnectable();
    set_connectable = FALSE;
  }

  if (connected) {
    uint32_t now = HAL_GetTick();

    if ((now - last_ms) >= 1000U) {
      last_ms = now;

      // update
      BlueMS_Counter_Update(counter++);
      BlueMS_Runtime_Update(runtime_s++);

      BlueMS_RPM_Update(rpm);
      BlueMS_Speed_Update(speed);
      BlueMS_Distance_Update(distance);

      BlueMS_VibX_Update(vibx);
      BlueMS_VibY_Update(viby);
      BlueMS_VibZ_Update(vibz);

      // changing test data movement
      rpm += 50;
      if (rpm > 3000) {
        rpm = 800;
      }

      speed += 2;
      if (speed > 70) {
        speed = 0;
      }

      distance += speed;

      vibx = -vibx;

      viby += 1;
      if (viby > 20) {
        viby = -20;
      }

      vibz -= 1;
      if (vibz < -20) {
        vibz = 20;
      }
    }
  }

#if USE_BUTTON
  /* Optional middleware-generated button flow retained but unused */
  if (user_button_pressed) {
    user_button_pressed = 0;
  }
#endif
}

/**
  * @brief  BSP Push Button callback
  * @param  Button Specifies the pin connected EXTI line
  * @retval None.
  */
void BSP_PB_Callback(Button_TypeDef Button)
{
  user_button_pressed = 1;
}
