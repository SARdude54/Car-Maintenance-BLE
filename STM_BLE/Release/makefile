################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

-include ../makefile.init

RM := rm -rf

# All of the sources participating in the build are defined here
-include sources.mk
-include Middlewares/ST/BlueNRG-MS/utils/subdir.mk
-include Middlewares/ST/BlueNRG-MS/hci/hci_tl_patterns/Basic/subdir.mk
-include Middlewares/ST/BlueNRG-MS/hci/controller/subdir.mk
-include Middlewares/ST/BlueNRG-MS/hci/subdir.mk
-include Drivers/STM32L4xx_HAL_Driver/Src/subdir.mk
-include Drivers/BSP/STM32L4xx_Nucleo/subdir.mk
-include Core/Startup/subdir.mk
-include Core/Src/subdir.mk
-include BlueNRG_MS/Target/subdir.mk
-include BlueNRG_MS/App/subdir.mk
-include objects.mk

ifneq ($(MAKECMDGOALS),clean)
ifneq ($(strip $(S_DEPS)),)
-include $(S_DEPS)
endif
ifneq ($(strip $(S_UPPER_DEPS)),)
-include $(S_UPPER_DEPS)
endif
ifneq ($(strip $(C_DEPS)),)
-include $(C_DEPS)
endif
endif

-include ../makefile.defs

OPTIONAL_TOOL_DEPS := \
$(wildcard ../makefile.defs) \
$(wildcard ../makefile.init) \
$(wildcard ../makefile.targets) \


BUILD_ARTIFACT_NAME := STM_BLE
BUILD_ARTIFACT_EXTENSION := elf
BUILD_ARTIFACT_PREFIX :=
BUILD_ARTIFACT := $(BUILD_ARTIFACT_PREFIX)$(BUILD_ARTIFACT_NAME)$(if $(BUILD_ARTIFACT_EXTENSION),.$(BUILD_ARTIFACT_EXTENSION),)

# Add inputs and outputs from these tool invocations to the build variables 
EXECUTABLES += \
STM_BLE.elf \

MAP_FILES += \
STM_BLE.map \

SIZE_OUTPUT += \
default.size.stdout \

OBJDUMP_LIST += \
STM_BLE.list \

OBJCOPY_BIN += \
STM_BLE.bin \


# All Target
all: main-build

# Main-build Target
main-build: STM_BLE.elf secondary-outputs

# Tool invocations
STM_BLE.elf STM_BLE.map: $(OBJS) $(USER_OBJS) /home/sardude54/Car-Maintenance-BLE/STM_BLE/STM32L476RGTX_FLASH.ld makefile objects.list $(OPTIONAL_TOOL_DEPS)
	arm-none-eabi-gcc -o "STM_BLE.elf" @"objects.list" $(USER_OBJS) $(LIBS) -mcpu=cortex-m4 -T"/home/sardude54/Car-Maintenance-BLE/STM_BLE/STM32L476RGTX_FLASH.ld" --specs=nosys.specs -Wl,-Map="STM_BLE.map" -Wl,--gc-sections -static --specs=nano.specs -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mthumb -Wl,--start-group -lc -lm -Wl,--end-group
	@echo 'Finished building target: $@'
	@echo ' '

default.size.stdout: $(EXECUTABLES) makefile objects.list $(OPTIONAL_TOOL_DEPS)
	arm-none-eabi-size  $(EXECUTABLES)
	@echo 'Finished building: $@'
	@echo ' '

STM_BLE.list: $(EXECUTABLES) makefile objects.list $(OPTIONAL_TOOL_DEPS)
	arm-none-eabi-objdump -h -S $(EXECUTABLES) > "STM_BLE.list"
	@echo 'Finished building: $@'
	@echo ' '

STM_BLE.bin: $(EXECUTABLES) makefile objects.list $(OPTIONAL_TOOL_DEPS)
	arm-none-eabi-objcopy  -O binary $(EXECUTABLES) "STM_BLE.bin"
	@echo 'Finished building: $@'
	@echo ' '

# Other Targets
clean:
	-$(RM) STM_BLE.bin STM_BLE.elf STM_BLE.list STM_BLE.map default.size.stdout
	-@echo ' '

secondary-outputs: $(SIZE_OUTPUT) $(OBJDUMP_LIST) $(OBJCOPY_BIN)

fail-specified-linker-script-missing:
	@echo 'Error: Cannot find the specified linker script. Check the linker settings in the build configuration.'
	@exit 2

warn-no-linker-script-specified:
	@echo 'Warning: No linker script specified. Check the linker settings in the build configuration.'

.PHONY: all clean dependents main-build fail-specified-linker-script-missing warn-no-linker-script-specified

-include ../makefile.targets
