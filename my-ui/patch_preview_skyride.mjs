import fs from 'fs';

let code = fs.readFileSync('src/nerve/preview.ts', 'utf8');

const skyrideTypes = `
export type SkyRide = {
  id: string
  driverName: string
  vehicleModel: string
  licensePlate: string
  pickup: string
  destination: string
  fare: number
  status: string
  etaMinutes: number
  driverRating: number
}

export type SkyRideHistory = {
  id: string
  destination: string
  date: string
  fare: number
}

export type RideUpdateEvent = {
  id: string
  status: string
}

export type PreviewSkyRideService = {
  GetRideStatus: NerveMethod<Record<string, never> | undefined, [{ activeRide?: SkyRide; history: SkyRideHistory[] }]>
  RequestRide: NerveMethod<{ pickup: string; destination: string; tier: string }, [boolean, string?, SkyRide?]>
  CancelRide: NerveMethod<Record<string, never> | undefined, [boolean, string?, string?]>
  RideStatusChanged: NerveSignal<[SkyRide]>
  RideUpdated: NerveSignal<[RideUpdateEvent]>
}
`;

code = code.replace(
  'export type VoiceMemo = {',
  skyrideTypes + '\nexport type VoiceMemo = {'
);

const skyrideState = `
  let currentSkyRide: SkyRide | null = null

  const skyRideHistoryData: SkyRideHistory[] = [
    { id: 'ride-h1', destination: 'Del Perro Pier', date = 'Yesterday', fare: 45 },
    { id: 'ride-h2', destination: 'Diamond Casino & Resort', date = '3 days ago', fare: 65 },
  ]
`.replace("date = 'Yesterday'", "date: 'Yesterday'").replace("date = '3 days ago'", "date: '3 days ago'");

code = code.replace(
  'const memosData: VoiceMemo[] = [',
  skyrideState + '\n  const memosData: VoiceMemo[] = ['
);

const skyrideHandlers = `
      'SkyRideService.GetRideStatus': () => {
        return [{
          activeRide: currentSkyRide ? { ...currentSkyRide } : undefined,
          history: skyRideHistoryData.map((h) => ({ ...h })),
        }]
      },
      'SkyRideService.RequestRide': (payload) => {
        if (!isRecord(payload) || typeof payload.destination !== 'string' || !payload.destination) {
          return [false, 'Destination required', undefined]
        }
        let fare = 35
        let vehicle = 'Albany Primo'
        if (payload.tier === 'Executive') {
          fare = 75
          vehicle = 'Enus Windsor Drop'
        } else if (payload.tier === 'XL') {
          fare = 90
          vehicle = 'Gallivanter Baller ST'
        }
        const ride: SkyRide = {
          id: 'ride-' + Date.now(),
          driverName: 'Dmitri Vance',
          vehicleModel: vehicle,
          licensePlate: 'SKY-782',
          pickup: typeof payload.pickup === 'string' && payload.pickup ? payload.pickup : 'Current GPS Location',
          destination: payload.destination,
          fare,
          status: 'accepted',
          etaMinutes: 2,
          driverRating: 4.95,
        }
        currentSkyRide = ride
        adapter.emitSignal('SkyRideService', 'RideStatusChanged', { ...ride })
        return [true, undefined, { ...ride }]
      },
      'SkyRideService.CancelRide': () => {
        if (!currentSkyRide) return [false, 'No active ride', undefined]
        const id = currentSkyRide.id
        currentSkyRide = null
        adapter.emitSignal('SkyRideService', 'RideUpdated', { id, status: 'cancelled' })
        return [true, undefined, id]
      },
`;

code = code.replace(
  "'MemosService.GetMemos': () => {",
  skyrideHandlers + "\n      'MemosService.GetMemos': () => {"
);

// Add 'skyride' to installedAppIds
code = code.replace(
  "'calendar', 'memos'",
  "'calendar', 'memos', 'skyride'"
);

code += `export const SkyRideService = nervePreview.GetService<PreviewSkyRideService>('SkyRideService')\n`;

fs.writeFileSync('src/nerve/preview.ts', code, 'utf8');
console.log('Successfully updated preview.ts with SkyRideService!');
