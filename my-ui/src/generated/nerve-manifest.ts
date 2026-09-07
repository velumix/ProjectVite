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
    },
    "PhoneService": {
      "GetPhoneState": {
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
                "phoneNumber": {
                  "kind": "string"
                },
                "battery": {
                  "kind": "float64"
                },
                "contacts": {
                  "kind": "array",
                  "value": {
                    "kind": "struct",
                    "fields": {
                      "id": {
                        "kind": "string"
                      },
                      "name": {
                        "kind": "string"
                      },
                      "number": {
                        "kind": "string"
                      }
                    }
                  }
                },
                "conversations": {
                  "kind": "array",
                  "value": {
                    "kind": "struct",
                    "fields": {
                      "contactId": {
                        "kind": "string"
                      },
                      "lastMessage": {
                        "kind": "string"
                      },
                      "time": {
                        "kind": "string"
                      },
                      "unread": {
                        "kind": "int32"
                      }
                    }
                  }
                },
                "settings": {
                  "kind": "struct",
                  "fields": {
                    "airplaneMode": {
                      "kind": "bool"
                    },
                    "wifiEnabled": {
                      "kind": "bool"
                    },
                    "bluetoothEnabled": {
                      "kind": "bool"
                    },
                    "darkMode": {
                      "kind": "bool"
                    },
                    "ringtone": {
                      "kind": "string"
                    }
                  }
                }
              }
            }
          ]
        }
      },
      "GetMessages": {
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
              "kind": "array",
              "value": {
                "kind": "struct",
                "fields": {
                  "id": {
                    "kind": "string"
                  },
                  "body": {
                    "kind": "string"
                  },
                  "fromPlayer": {
                    "kind": "bool"
                  },
                  "time": {
                    "kind": "string"
                  }
                }
              }
            }
          ]
        }
      },
      "SendMessage": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "number": {
              "kind": "string"
            },
            "body": {
              "kind": "string"
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
          "requests": 12,
          "window": 1
        }
      },
      "StartCall": {
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
            }
          ]
        },
        "rateLimit": {
          "requests": 6,
          "window": 1
        }
      },
      "EndCall": {
        "kind": "method",
        "request": {
          "kind": "tuple",
          "items": []
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
        }
      },
      "SavePhoneSettings": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "airplaneMode": {
              "kind": "bool"
            },
            "wifiEnabled": {
              "kind": "bool"
            },
            "bluetoothEnabled": {
              "kind": "bool"
            },
            "darkMode": {
              "kind": "bool"
            },
            "ringtone": {
              "kind": "string"
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
      "MessageReceived": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "string"
            },
            {
              "kind": "string"
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      },
      "CallStateChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "string"
            },
            {
              "kind": "string"
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      },
      "PhoneSettingsChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "struct",
              "fields": {
                "airplaneMode": {
                  "kind": "bool"
                },
                "wifiEnabled": {
                  "kind": "bool"
                },
                "bluetoothEnabled": {
                  "kind": "bool"
                },
                "darkMode": {
                  "kind": "bool"
                },
                "ringtone": {
                  "kind": "string"
                }
              }
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      }
    },
    "BankingService": {
      "GetBankingOverview": {
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
                "bank": {
                  "kind": "float64"
                },
                "cash": {
                  "kind": "float64"
                },
                "currency": {
                  "kind": "string"
                },
                "playerId": {
                  "kind": "int32"
                },
                "playerName": {
                  "kind": "string"
                },
                "transactions": {
                  "kind": "array",
                  "value": {
                    "kind": "struct",
                    "fields": {
                      "id": {
                        "kind": "string"
                      },
                      "kind": {
                        "kind": "string"
                      },
                      "amount": {
                        "kind": "float64"
                      },
                      "label": {
                        "kind": "string"
                      },
                      "reference": {
                        "kind": "string"
                      },
                      "createdAt": {
                        "kind": "float64"
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      },
      "TransferMoney": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "amount": {
              "kind": "float64"
            },
            "phoneNumber": {
              "kind": "string"
            },
            "note": {
              "kind": "optional",
              "value": {
                "kind": "string"
              }
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
      "DepositMoney": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "amount": {
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
      "WithdrawMoney": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "amount": {
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
      "BankingChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "struct",
              "fields": {
                "kind": {
                  "kind": "string"
                },
                "amount": {
                  "kind": "float64"
                },
                "currency": {
                  "kind": "string"
                },
                "sender": {
                  "kind": "optional",
                  "value": {
                    "kind": "string"
                  }
                },
                "label": {
                  "kind": "optional",
                  "value": {
                    "kind": "string"
                  }
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
