export interface GatewayInfo {
  device: {
    hardwareVersion: string
    macId: string
    manufacturer: string
    model: string
    role: string
    serial: string
    softwareVersion: string
  }
  signal: {
    "5g": {
      antennaUsed: string
      bands: string[]
      bars: number
      cid: number
      gNBID: number
      rsrp: number
      rsrq: number
      rssi: number
      sinr: number
    }
    "4g"?: {
      antennaUsed: string
      bands: string[]
      bars: number
      cid: number
      eNBID: number
      rsrp: number
      rsrq: number
      rssi: number
      sinr: number
    }
    generic: {
      apn: string
      hasIPv6: boolean
      registration: string
    }
  }
  time: {
    localTime: number
    localTimeZone: string
    upTime: number
  }
}

export interface SignalInfo {
  signal: {
    "5g": {
      antennaUsed: string
      bands: string[]
      bars: number
      cid: number
      gNBID: number
      rsrp: number
      rsrq: number
      rssi: number
      sinr: number
    }
    generic: {
      apn: string
      hasIPv6: boolean
      registration: string
    }
  }
}

export interface CellInfo {
  cell: {
    "5g": {
      cqi: number
      ecgi: string
      sector: {
        antennaUsed: string
        bands: string[]
        bars: number
        cid: number
        gNBID: number
        rsrp: number
        rsrq: number
        rssi: number
        sinr: number
      }
    }
    generic: {
      apn: string
      hasIPv6: boolean
      registration: string
    }
    gps: {
      latitude: number
      longitude: number
    }
  }
}

export interface ClientInfo {
  clients: {
    "2.4ghz": Client[]
    "5.0ghz": Client[]
    "6.0ghz"?: Client[]
    ethernet: Client[]
    wifi: Client[]
  }
}

export interface Client {
  connected: boolean
  ipv4: string
  ipv6: string[]
  mac: string
  name: string
  signal?: number
}

export interface SimInfo {
  sim: {
    iccId: string
    imei: string
    imsi: string
    msisdn: string
    status: boolean
  }
}

export interface ApConfig {
  "2.4ghz": { isRadioEnabled: boolean }
  "5.0ghz": { isRadioEnabled: boolean }
  "6.0ghz"?: { isRadioEnabled: boolean }
  ssids: {
    "2.4ghzSsid": boolean
    "5.0ghzSsid": boolean
    "6.0ghzSsid"?: boolean
    encryptionMode: string
    encryptionVersion: string
    guest: boolean
    isBroadcastEnabled: boolean
    ssidName: string
    wpaKey: string
  }[]
}

export interface VersionInfo {
  version: number
}

export interface TelemetryAll {
  cell: {
    "5g": {
      cqi: number
      ecgi: string
      sector: {
        antennaUsed: string
        bands: string[]
        bars: number
        cid: number
        gNBID: number
        rsrp: number
        rsrq: number
        rssi: number
        sinr: number
      }
    }
    generic: {
      apn: string
      hasIPv6: boolean
      registration: string
    }
    gps: {
      latitude: number
      longitude: number
    }
  }
  clients: {
    "2.4ghz": Client[]
    "5.0ghz": Client[]
    "6.0ghz"?: Client[]
    ethernet: Client[]
    wifi: Client[]
  }
  sim: {
    iccId: string
    imei: string
    imsi: string
    msisdn: string
    status: boolean
  }
}
