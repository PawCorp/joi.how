import { ButtplugClient, ButtplugClientDevice, ButtplugEmbeddedConnectorOptions, ButtplugDeviceMessageType, buttplugInit } from 'buttplug'
import { Thunk } from '../../../store.types'
import { Vibrator } from '../../../services/vibrator'

export const T_VIBRATOR_TRY_TO_PAIR_FAIL = 'VIBRATOR_TRY_TO_PAIR_FAILED'
export const T_VIBRATOR_PAIRED = 'VIBRATOR_PAIRED'
export const T_VIBRATOR_UNPAIRED = 'VIBRATOR_UNPAIRED'
export const T_VIBRATOR_SET_MODE = 'VIBRATOR_SET_MODE'

export class DeviceNotSupportedError extends Error {}

export enum VibrationStyleMode {
  THUMP,
  CONSTANT,
}

class SettingsVibratorActionsBase {
  private client?: ButtplugClient

  private connector?: ButtplugEmbeddedConnectorOptions

  private buttplugInitialised: boolean = false

  private async getButtplug(): Promise<[ButtplugClient, ButtplugEmbeddedConnectorOptions]> {
    if (!this.buttplugInitialised) {
      await buttplugInit()

      this.client = new ButtplugClient('JOI.how Client')
      this.connector = new ButtplugEmbeddedConnectorOptions()

      this.buttplugInitialised = true
    }

    return [this.client!, this.connector!]
  }

  TryToPair(): Thunk {
    return async dispatch => {
      const [client, connector] = await this.getButtplug()

      client.removeAllListeners()
      client.addListener('deviceadded', (device: ButtplugClientDevice) => {
        if (device.AllowedMessages.indexOf(ButtplugDeviceMessageType.VibrateCmd) >= 0) {
          dispatch(this.Paired(device))
        } else {
          dispatch(this.PairFailed(new DeviceNotSupportedError()))
        }
      })

      try {
        await client.connect(connector)
        await client.startScanning()
      } catch (e) {
        dispatch(this.PairFailed(e))
      }
    }
  }

  TryToUnpair(): Thunk {
    return async dispatch => {
      const [client, _] = await this.getButtplug()
      await client.stopAllDevices()
      await client.disconnect()
      dispatch(this.Unpaired())
    }
  }

  PairFailed = (error: Error) => ({
    type: T_VIBRATOR_TRY_TO_PAIR_FAIL as typeof T_VIBRATOR_TRY_TO_PAIR_FAIL,
    payload: error,
  })

  Paired = (device: ButtplugClientDevice | null) => ({
    type: T_VIBRATOR_PAIRED as typeof T_VIBRATOR_PAIRED,
    payload: !!device ? new Vibrator(device) : null,
  })

  Unpaired = () => ({
    type: T_VIBRATOR_UNPAIRED as typeof T_VIBRATOR_UNPAIRED,
  })

  SetMode = (mode: VibrationStyleMode) => ({
    type: T_VIBRATOR_SET_MODE as typeof T_VIBRATOR_SET_MODE,
    payload: mode,
  })
}

export const SettingsVibratorActions = new SettingsVibratorActionsBase()

export type SettingsVibratorAction =
  | SettingsVibratorActionsBase['PairFailed']
  | SettingsVibratorActionsBase['Paired']
  | SettingsVibratorActionsBase['Unpaired']
  | SettingsVibratorActionsBase['SetMode']
