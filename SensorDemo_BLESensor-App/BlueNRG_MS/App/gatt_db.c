/**
  ******************************************************************************
  * @file    App/gatt_db.c
  * @author  SRA Application Team
  * @brief   Functions to build GATT DB and handle GATT events
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2026 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "bluenrg_def.h"
#include "gatt_db.h"
#include "bluenrg_conf.h"
#include "bluenrg_gatt_aci.h"

/** @brief Macro that stores Value into a buffer in Little Endian Format (2 bytes)*/
#define HOST_TO_LE_16(buf, val)    ( ((buf)[0] =  (uint8_t) (val)    ) , \
                                   ((buf)[1] =  (uint8_t) (val>>8) ) )

/** @brief Macro that stores Value into a buffer in Little Endian Format (4 bytes) */
#define HOST_TO_LE_32(buf, val)    ( ((buf)[0] =  (uint8_t) (val)     ) , \
                                   ((buf)[1] =  (uint8_t) (val>>8)  ) , \
                                   ((buf)[2] =  (uint8_t) (val>>16) ) , \
                                   ((buf)[3] =  (uint8_t) (val>>24) ) )

#define COPY_UUID_128(uuid_struct, uuid_15, uuid_14, uuid_13, uuid_12, uuid_11, uuid_10, uuid_9, uuid_8, uuid_7, uuid_6, uuid_5, uuid_4, uuid_3, uuid_2, uuid_1, uuid_0) \
do {\
    uuid_struct[0] = uuid_0; uuid_struct[1] = uuid_1; uuid_struct[2] = uuid_2; uuid_struct[3] = uuid_3; \
    uuid_struct[4] = uuid_4; uuid_struct[5] = uuid_5; uuid_struct[6] = uuid_6; uuid_struct[7] = uuid_7; \
    uuid_struct[8] = uuid_8; uuid_struct[9] = uuid_9; uuid_struct[10] = uuid_10; uuid_struct[11] = uuid_11; \
    uuid_struct[12] = uuid_12; uuid_struct[13] = uuid_13; uuid_struct[14] = uuid_14; uuid_struct[15] = uuid_15; \
} while(0)

/* Service UUID */
#define COPY_DIAGNOSTICS_SERVICE_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88)

/* Characteristic UUIDs */
#define COPY_COUNTER_CHAR_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x89)

#define COPY_RUNTIME_CHAR_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x8A)

#define COPY_RPM_CHAR_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x8B)

#define COPY_SPEED_CHAR_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x8C)

#define COPY_DISTANCE_CHAR_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x8D)

#define COPY_VIBX_CHAR_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x8E)

#define COPY_VIBY_CHAR_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x8F)

#define COPY_VIBZ_CHAR_UUID(uuid_struct) COPY_UUID_128(uuid_struct, \
  0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x90)

// handles
uint16_t DiagnosticsServiceHandle;
uint16_t CounterCharHandle;
uint16_t RuntimeCharHandle;
uint16_t RPMCharHandle;
uint16_t SpeedCharHandle;
uint16_t DistanceCharHandle;
uint16_t VibXCharHandle;
uint16_t VibYCharHandle;
uint16_t VibZCharHandle;

// UUID
Service_UUID_t service_uuid;
Char_UUID_t char_uuid;

extern uint16_t connection_handle;
extern uint32_t start_time;
/*
 *
 * Main service to display EVA diagnostics
 *
 * */

tBleStatus Add_Diagnostics_Service(void)
{
  tBleStatus ret;
  uint8_t uuid[16];

  COPY_DIAGNOSTICS_SERVICE_UUID(uuid);
  BLUENRG_memcpy(&service_uuid.Service_UUID_128, uuid, 16);

  // 8 characteristics => 1 + 3*8 attribute records
  ret = aci_gatt_add_serv(UUID_TYPE_128,
                          service_uuid.Service_UUID_128,
                          PRIMARY_SERVICE,
                          1 + 3*8,
                          &DiagnosticsServiceHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  // 32 bit counter, used for debugging not in the app */
  COPY_COUNTER_CHAR_UUID(uuid);
  BLUENRG_memcpy(&char_uuid.Char_UUID_128, uuid, 16);
  ret = aci_gatt_add_char(DiagnosticsServiceHandle,
                          UUID_TYPE_128,
                          char_uuid.Char_UUID_128,
                          4,
                          CHAR_PROP_NOTIFY | CHAR_PROP_READ,
                          ATTR_PERMISSION_NONE,
                          GATT_DONT_NOTIFY_EVENTS,
                          16, 0,
                          &CounterCharHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  // 32 bit runtime characteristic
  COPY_RUNTIME_CHAR_UUID(uuid);
  BLUENRG_memcpy(&char_uuid.Char_UUID_128, uuid, 16);
  ret = aci_gatt_add_char(DiagnosticsServiceHandle,
                          UUID_TYPE_128,
                          char_uuid.Char_UUID_128,
                          4,
                          CHAR_PROP_NOTIFY | CHAR_PROP_READ,
                          ATTR_PERMISSION_NONE,
                          GATT_DONT_NOTIFY_EVENTS,
                          16, 0,
                          &RuntimeCharHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  // 16 bit RPM characteristic
  COPY_RPM_CHAR_UUID(uuid);
  BLUENRG_memcpy(&char_uuid.Char_UUID_128, uuid, 16);
  ret = aci_gatt_add_char(DiagnosticsServiceHandle,
                          UUID_TYPE_128,
                          char_uuid.Char_UUID_128,
                          2,
                          CHAR_PROP_NOTIFY | CHAR_PROP_READ,
                          ATTR_PERMISSION_NONE,
                          GATT_DONT_NOTIFY_EVENTS,
                          16, 0,
                          &RPMCharHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  // 16 bit speed characteristic
  COPY_SPEED_CHAR_UUID(uuid);
  BLUENRG_memcpy(&char_uuid.Char_UUID_128, uuid, 16);
  ret = aci_gatt_add_char(DiagnosticsServiceHandle,
                          UUID_TYPE_128,
                          char_uuid.Char_UUID_128,
                          2,
                          CHAR_PROP_NOTIFY | CHAR_PROP_READ,
                          ATTR_PERMISSION_NONE,
                          GATT_DONT_NOTIFY_EVENTS,
                          16, 0,
                          &SpeedCharHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  // 32 bit distance
  COPY_DISTANCE_CHAR_UUID(uuid);
  BLUENRG_memcpy(&char_uuid.Char_UUID_128, uuid, 16);
  ret = aci_gatt_add_char(DiagnosticsServiceHandle,
                          UUID_TYPE_128,
                          char_uuid.Char_UUID_128,
                          4,
                          CHAR_PROP_NOTIFY | CHAR_PROP_READ,
                          ATTR_PERMISSION_NONE,
                          GATT_DONT_NOTIFY_EVENTS,
                          16, 0,
                          &DistanceCharHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  // 16 bit x-axis vibration
  COPY_VIBX_CHAR_UUID(uuid);
  BLUENRG_memcpy(&char_uuid.Char_UUID_128, uuid, 16);
  ret = aci_gatt_add_char(DiagnosticsServiceHandle,
                          UUID_TYPE_128,
                          char_uuid.Char_UUID_128,
                          2,
                          CHAR_PROP_NOTIFY | CHAR_PROP_READ,
                          ATTR_PERMISSION_NONE,
                          GATT_DONT_NOTIFY_EVENTS,
                          16, 0,
                          &VibXCharHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  // 16 bit y-axis vibration
  COPY_VIBY_CHAR_UUID(uuid);
  BLUENRG_memcpy(&char_uuid.Char_UUID_128, uuid, 16);
  ret = aci_gatt_add_char(DiagnosticsServiceHandle,
                          UUID_TYPE_128,
                          char_uuid.Char_UUID_128,
                          2,
                          CHAR_PROP_NOTIFY | CHAR_PROP_READ,
                          ATTR_PERMISSION_NONE,
                          GATT_DONT_NOTIFY_EVENTS,
                          16, 0,
                          &VibYCharHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  // 16 bit z-axis vibration
  COPY_VIBZ_CHAR_UUID(uuid);
  BLUENRG_memcpy(&char_uuid.Char_UUID_128, uuid, 16);
  ret = aci_gatt_add_char(DiagnosticsServiceHandle,
                          UUID_TYPE_128,
                          char_uuid.Char_UUID_128,
                          2,
                          CHAR_PROP_NOTIFY | CHAR_PROP_READ,
                          ATTR_PERMISSION_NONE,
                          GATT_DONT_NOTIFY_EVENTS,
                          16, 0,
                          &VibZCharHandle);
  if (ret != BLE_STATUS_SUCCESS) return BLE_STATUS_ERROR;

  return BLE_STATUS_SUCCESS;
}

/* ---------------- Update functions ---------------- */

tBleStatus BlueMS_Counter_Update(uint32_t counter)
{
  tBleStatus ret;
  uint8_t buff[4];
  HOST_TO_LE_32(buff, counter);

  ret = aci_gatt_update_char_value(DiagnosticsServiceHandle,
                                   CounterCharHandle,
                                   0, sizeof(buff), buff);

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("Counter update failed: 0x%02X\n", ret);
    return BLE_STATUS_ERROR;
  }
  return BLE_STATUS_SUCCESS;
}

tBleStatus BlueMS_Runtime_Update(uint32_t runtime_seconds)
{
  tBleStatus ret;
  uint8_t buff[4];
  HOST_TO_LE_32(buff, runtime_seconds);

  ret = aci_gatt_update_char_value(DiagnosticsServiceHandle,
                                   RuntimeCharHandle,
                                   0, sizeof(buff), buff);

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("Runtime update failed: 0x%02X\n", ret);
    return BLE_STATUS_ERROR;
  }
  return BLE_STATUS_SUCCESS;
}

tBleStatus BlueMS_RPM_Update(uint16_t rpm)
{
  tBleStatus ret;
  uint8_t buff[2];
  HOST_TO_LE_16(buff, rpm);

  ret = aci_gatt_update_char_value(DiagnosticsServiceHandle,
                                   RPMCharHandle,
                                   0, sizeof(buff), buff);

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("RPM update failed: 0x%02X\n", ret);
    return BLE_STATUS_ERROR;
  }
  return BLE_STATUS_SUCCESS;
}

tBleStatus BlueMS_Speed_Update(uint16_t speed)
{
  tBleStatus ret;
  uint8_t buff[2];
  HOST_TO_LE_16(buff, speed);

  ret = aci_gatt_update_char_value(DiagnosticsServiceHandle,
                                   SpeedCharHandle,
                                   0, sizeof(buff), buff);

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("Speed update failed: 0x%02X\n", ret);
    return BLE_STATUS_ERROR;
  }
  return BLE_STATUS_SUCCESS;
}

tBleStatus BlueMS_Distance_Update(uint32_t distance)
{
  tBleStatus ret;
  uint8_t buff[4];
  HOST_TO_LE_32(buff, distance);

  ret = aci_gatt_update_char_value(DiagnosticsServiceHandle,
                                   DistanceCharHandle,
                                   0, sizeof(buff), buff);

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("Distance update failed: 0x%02X\n", ret);
    return BLE_STATUS_ERROR;
  }
  return BLE_STATUS_SUCCESS;
}

tBleStatus BlueMS_VibX_Update(int16_t vibx)
{
  tBleStatus ret;
  uint8_t buff[2];
  HOST_TO_LE_16(buff, (uint16_t)vibx);

  ret = aci_gatt_update_char_value(DiagnosticsServiceHandle,
                                   VibXCharHandle,
                                   0, sizeof(buff), buff);

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("VibX update failed: 0x%02X\n", ret);
    return BLE_STATUS_ERROR;
  }
  return BLE_STATUS_SUCCESS;
}

tBleStatus BlueMS_VibY_Update(int16_t viby)
{
  tBleStatus ret;
  uint8_t buff[2];
  HOST_TO_LE_16(buff, (uint16_t)viby);

  ret = aci_gatt_update_char_value(DiagnosticsServiceHandle,
                                   VibYCharHandle,
                                   0, sizeof(buff), buff);

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("VibY update failed: 0x%02X\n", ret);
    return BLE_STATUS_ERROR;
  }
  return BLE_STATUS_SUCCESS;
}

tBleStatus BlueMS_VibZ_Update(int16_t vibz)
{
  tBleStatus ret;
  uint8_t buff[2];
  HOST_TO_LE_16(buff, (uint16_t)vibz);

  ret = aci_gatt_update_char_value(DiagnosticsServiceHandle,
                                   VibZCharHandle,
                                   0, sizeof(buff), buff);

  if (ret != BLE_STATUS_SUCCESS) {
    PRINTF("VibZ update failed: 0x%02X\n", ret);
    return BLE_STATUS_ERROR;
  }
  return BLE_STATUS_SUCCESS;
}

/*******************************************************************************
* Function Name  : Read_Request_CB.
* Description    : Update the sensor values.
* Input          : Handle of the characteristic to update.
* Return         : None.
*******************************************************************************/
void Read_Request_CB(uint16_t handle)
{
  tBleStatus ret;

  if (connection_handle != 0)
  {
    ret = aci_gatt_allow_read(connection_handle);
    if (ret != BLE_STATUS_SUCCESS)
    {
      PRINTF("aci_gatt_allow_read() failed: 0x%02x\r\n", ret);
    }
  }
}
