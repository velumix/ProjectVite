// Generated from NerveManifest. Do not edit by hand.
import type { NerveNetworkManifest } from '../nerve/manifest.ts'

export const nerveManifest = {
  "version": 1,
  "services": {
    "InventoryService": {
      "BuyItem": {
        "kind": "method",
        "request": {
          "kind": "tuple",
          "items": [
            {
              "kind": "string"
            }
          ]
        },
        "response": {
          "kind": "tuple",
          "items": [
            {
              "kind": "bool"
            },
            {
              "kind": "optional",
              "value": {
                "kind": "string"
              }
            },
            {
              "kind": "optional",
              "value": {
                "kind": "float64"
              }
            }
          ]
        },
        "rateLimit": {
          "requests": 12,
          "window": 1
        }
      },
      "GetInventory": {
        "kind": "method",
        "request": {
          "kind": "tuple",
          "items": []
        },
        "response": {
          "kind": "tuple",
          "items": [
            {
              "kind": "array",
              "value": {
                "kind": "struct",
                "fields": {
                  "ItemId": {
                    "kind": "string"
                  },
                  "Quantity": {
                    "kind": "int32"
                  }
                }
              }
            }
          ]
        }
      },
      "EquipItem": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "string"
            }
          ]
        },
        "direction": "client",
        "reliability": "reliable"
      },
      "MoneyChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "float64"
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      },
      "InventoryChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "string"
            },
            {
              "kind": "int32"
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      }
    },
    "SettingsService": {
      "GetSettings": {
        "kind": "method",
        "request": {
          "kind": "tuple",
          "items": []
        },
        "response": {
          "kind": "tuple",
          "items": [
            {
              "kind": "struct",
              "fields": {
                "language": {
                  "kind": "string"
                },
                "uiScale": {
                  "kind": "float64"
                },
                "showTooltips": {
                  "kind": "bool"
                },
                "streamerMode": {
                  "kind": "bool"
                },
                "showQuantities": {
                  "kind": "bool"
                },
                "performancePreset": {
                  "kind": "string"
                },
                "disablePostProcessing": {
                  "kind": "bool"
                },
                "reduceEffects": {
                  "kind": "bool"
                },
                "lowerReflectionDetail": {
                  "kind": "bool"
                },
                "shadowDetail": {
                  "kind": "float64"
                },
                "viewDistance": {
                  "kind": "float64"
                },
                "masterVolume": {
                  "kind": "float64"
                },
                "musicVolume": {
                  "kind": "float64"
                },
                "sfxVolume": {
                  "kind": "float64"
                },
                "radioVolume": {
                  "kind": "float64"
                },
                "voiceChatVolume": {
                  "kind": "float64"
                },
                "lookSensitivity": {
                  "kind": "float64"
                },
                "invertLook": {
                  "kind": "bool"
                },
                "holdToSprint": {
                  "kind": "bool"
                },
                "showMinimap": {
                  "kind": "bool"
                },
                "showCompass": {
                  "kind": "bool"
                },
                "damageNumbers": {
                  "kind": "bool"
                },
                "showNotifications": {
                  "kind": "bool"
                },
                "missionAlerts": {
                  "kind": "bool"
                },
                "chatNotifications": {
                  "kind": "bool"
                },
                "colorblindMode": {
                  "kind": "string"
                },
                "subtitles": {
                  "kind": "bool"
                },
                "highContrast": {
                  "kind": "bool"
                },
                "developerMode": {
                  "kind": "bool"
                },
                "showNetworkStats": {
                  "kind": "bool"
                },
                "motion": {
                  "kind": "bool"
                },
                "panelOpacity": {
                  "kind": "float64"
                }
              }
            }
          ]
        }
      },
      "SaveSettings": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "language": {
              "kind": "string"
            },
            "uiScale": {
              "kind": "float64"
            },
            "showTooltips": {
              "kind": "bool"
            },
            "streamerMode": {
              "kind": "bool"
            },
            "showQuantities": {
              "kind": "bool"
            },
            "performancePreset": {
              "kind": "string"
            },
            "disablePostProcessing": {
              "kind": "bool"
            },
            "reduceEffects": {
              "kind": "bool"
            },
            "lowerReflectionDetail": {
              "kind": "bool"
            },
            "shadowDetail": {
              "kind": "float64"
            },
            "viewDistance": {
              "kind": "float64"
            },
            "masterVolume": {
              "kind": "float64"
            },
            "musicVolume": {
              "kind": "float64"
            },
            "sfxVolume": {
              "kind": "float64"
            },
            "radioVolume": {
              "kind": "float64"
            },
            "voiceChatVolume": {
              "kind": "float64"
            },
            "lookSensitivity": {
              "kind": "float64"
            },
            "invertLook": {
              "kind": "bool"
            },
            "holdToSprint": {
              "kind": "bool"
            },
            "showMinimap": {
              "kind": "bool"
            },
            "showCompass": {
              "kind": "bool"
            },
            "damageNumbers": {
              "kind": "bool"
            },
            "showNotifications": {
              "kind": "bool"
            },
            "missionAlerts": {
              "kind": "bool"
            },
            "chatNotifications": {
              "kind": "bool"
            },
            "colorblindMode": {
              "kind": "string"
            },
            "subtitles": {
              "kind": "bool"
            },
            "highContrast": {
              "kind": "bool"
            },
            "developerMode": {
              "kind": "bool"
            },
            "showNetworkStats": {
              "kind": "bool"
            },
            "motion": {
              "kind": "bool"
            },
            "panelOpacity": {
              "kind": "float64"
            }
          }
        },
        "response": {
          "kind": "tuple",
          "items": [
            {
              "kind": "bool"
            },
            {
              "kind": "optional",
              "value": {
                "kind": "string"
              }
            }
          ]
        },
        "rateLimit": {
          "requests": 10,
          "window": 1
        }
      },
      "SettingsChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "struct",
              "fields": {
                "language": {
                  "kind": "string"
                },
                "uiScale": {
                  "kind": "float64"
                },
                "showTooltips": {
                  "kind": "bool"
                },
                "streamerMode": {
                  "kind": "bool"
                },
                "showQuantities": {
                  "kind": "bool"
                },
                "performancePreset": {
                  "kind": "string"
                },
                "disablePostProcessing": {
                  "kind": "bool"
                },
                "reduceEffects": {
                  "kind": "bool"
                },
                "lowerReflectionDetail": {
                  "kind": "bool"
                },
                "shadowDetail": {
                  "kind": "float64"
                },
                "viewDistance": {
                  "kind": "float64"
                },
                "masterVolume": {
                  "kind": "float64"
                },
                "musicVolume": {
                  "kind": "float64"
                },
                "sfxVolume": {
                  "kind": "float64"
                },
                "radioVolume": {
                  "kind": "float64"
                },
                "voiceChatVolume": {
                  "kind": "float64"
                },
                "lookSensitivity": {
                  "kind": "float64"
                },
                "invertLook": {
                  "kind": "bool"
                },
                "holdToSprint": {
                  "kind": "bool"
                },
                "showMinimap": {
                  "kind": "bool"
                },
                "showCompass": {
                  "kind": "bool"
                },
                "damageNumbers": {
                  "kind": "bool"
                },
                "showNotifications": {
                  "kind": "bool"
                },
                "missionAlerts": {
                  "kind": "bool"
                },
                "chatNotifications": {
                  "kind": "bool"
                },
                "colorblindMode": {
                  "kind": "string"
                },
                "subtitles": {
                  "kind": "bool"
                },
                "highContrast": {
                  "kind": "bool"
                },
                "developerMode": {
                  "kind": "bool"
                },
                "showNetworkStats": {
                  "kind": "bool"
                },
                "motion": {
                  "kind": "bool"
                },
                "panelOpacity": {
                  "kind": "float64"
                }
              }
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      }
    }
  }
} as const satisfies NerveNetworkManifest
