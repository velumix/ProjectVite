export type RobloxDisconnect = () => void

export type RobloxSignal<TArguments extends unknown[] = unknown[]> = {
  connect(handler: (...arguments_: TArguments) => void): RobloxDisconnect
}

export type RobloxInputEvent = {
  UserInputType: string
  Position: {
    X: number
    Y: number
  }
  OriginalEvent: unknown
}

export type RobloxEventName =
  | 'Activated'
  | 'MouseButton1Click'
  | 'MouseButton1Down'
  | 'MouseButton1Up'
  | 'MouseEnter'
  | 'MouseLeave'
  | 'InputBegan'
  | 'InputChanged'
  | 'InputEnded'
  | 'Changed'

export type RobloxEventArguments = {
  Activated: []
  MouseButton1Click: []
  MouseButton1Down: [RobloxInputEvent]
  MouseButton1Up: [RobloxInputEvent]
  MouseEnter: [RobloxInputEvent]
  MouseLeave: [RobloxInputEvent]
  InputBegan: [RobloxInputEvent]
  InputChanged: [RobloxInputEvent]
  InputEnded: [RobloxInputEvent]
  Changed: [string]
}

export type RobloxInstanceHandlers = {
  [EventName in RobloxEventName]?: (...arguments_: RobloxEventArguments[EventName]) => void
} & {
  GetPropertyChangedSignal?: Record<string, () => void>
}

export type RobloxHandlerRegistry = Record<string, RobloxInstanceHandlers>

export type RobloxEventAdapter = {
  signal<EventName extends RobloxEventName>(
    instanceName: string,
    eventName: EventName,
  ): RobloxSignal<RobloxEventArguments[EventName]>
  getPropertyChangedSignal(instanceName: string, propertyName: string): RobloxSignal
  emit<EventName extends RobloxEventName>(
    instanceName: string,
    eventName: EventName,
    ...arguments_: RobloxEventArguments[EventName]
  ): void
  emitChanged(instanceName: string, propertyName: string, value?: unknown): void
}

class LocalSignal<TArguments extends unknown[]> implements RobloxSignal<TArguments> {
  private readonly handlers = new Set<(...arguments_: TArguments) => void>()

  connect(handler: (...arguments_: TArguments) => void): RobloxDisconnect {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  fire(...arguments_: TArguments): void {
    for (const handler of this.handlers) handler(...arguments_)
  }
}

function signalKey(instanceName: string, eventName: string): string {
  return `${instanceName}:${eventName}`
}

export function createRobloxEventAdapter(): RobloxEventAdapter {
  const signals = new Map<string, LocalSignal<unknown[]>>()

  function getSignal(instanceName: string, eventName: string): LocalSignal<unknown[]> {
    const key = signalKey(instanceName, eventName)
    const existingSignal = signals.get(key)
    if (existingSignal) return existingSignal

    const signal = new LocalSignal<unknown[]>()
    signals.set(key, signal)
    return signal
  }

  return {
    signal(instanceName, eventName) {
      return getSignal(instanceName, eventName) as unknown as RobloxSignal<RobloxEventArguments[typeof eventName]>
    },
    getPropertyChangedSignal(instanceName, propertyName) {
      return getSignal(instanceName, `GetPropertyChangedSignal:${propertyName}`)
    },
    emit(instanceName, eventName, ...arguments_) {
      getSignal(instanceName, eventName).fire(...arguments_)
    },
    emitChanged(instanceName, propertyName, value) {
      getSignal(instanceName, 'Changed').fire(propertyName)
      getSignal(instanceName, `GetPropertyChangedSignal:${propertyName}`).fire(value)
    },
  }
}
