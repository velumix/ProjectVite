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
    },
    "MediaService": {
      "GetMediaList": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "filter": {
              "kind": "optional",
              "value": {
                "kind": "string"
              }
            },
            "favoritesOnly": {
              "kind": "optional",
              "value": {
                "kind": "bool"
              }
            }
          }
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
                  "mediaType": {
                    "kind": "string"
                  },
                  "url": {
                    "kind": "string"
                  },
                  "thumbnailUrl": {
                    "kind": "optional",
                    "value": {
                      "kind": "string"
                    }
                  },
                  "favorite": {
                    "kind": "bool"
                  },
                  "createdAt": {
                    "kind": "float64"
                  },
                  "title": {
                    "kind": "string"
                  },
                  "location": {
                    "kind": "optional",
                    "value": {
                      "kind": "string"
                    }
                  }
                }
              }
            },
            {
              "kind": "struct",
              "fields": {
                "all": {
                  "kind": "float64"
                },
                "photos": {
                  "kind": "float64"
                },
                "videos": {
                  "kind": "float64"
                },
                "favorites": {
                  "kind": "float64"
                }
              }
            }
          ]
        }
      },
      "CaptureMedia": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "mediaType": {
              "kind": "string"
            },
            "url": {
              "kind": "string"
            },
            "title": {
              "kind": "optional",
              "value": {
                "kind": "string"
              }
            },
            "location": {
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
                "kind": "struct",
                "fields": {
                  "id": {
                    "kind": "string"
                  },
                  "mediaType": {
                    "kind": "string"
                  },
                  "url": {
                    "kind": "string"
                  },
                  "thumbnailUrl": {
                    "kind": "optional",
                    "value": {
                      "kind": "string"
                    }
                  },
                  "favorite": {
                    "kind": "bool"
                  },
                  "createdAt": {
                    "kind": "float64"
                  },
                  "title": {
                    "kind": "string"
                  },
                  "location": {
                    "kind": "optional",
                    "value": {
                      "kind": "string"
                    }
                  }
                }
              }
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
      "ToggleFavorite": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "id": {
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
      "DeleteMedia": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "ids": {
              "kind": "array",
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
        }
      },
      "MediaChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "string"
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      }
    },
    "MailService": {
      "GetMailbox": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "folder": {
              "kind": "optional",
              "value": {
                "kind": "string"
              }
            },
            "query": {
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
              "kind": "array",
              "value": {
                "kind": "struct",
                "fields": {
                  "id": {
                    "kind": "string"
                  },
                  "sender": {
                    "kind": "string"
                  },
                  "senderName": {
                    "kind": "string"
                  },
                  "senderAddress": {
                    "kind": "string"
                  },
                  "recipient": {
                    "kind": "string"
                  },
                  "subject": {
                    "kind": "string"
                  },
                  "body": {
                    "kind": "string"
                  },
                  "timestamp": {
                    "kind": "float64"
                  },
                  "read": {
                    "kind": "bool"
                  },
                  "folder": {
                    "kind": "string"
                  },
                  "starred": {
                    "kind": "bool"
                  }
                }
              }
            },
            {
              "kind": "struct",
              "fields": {
                "inboxCount": {
                  "kind": "float64"
                },
                "unreadCount": {
                  "kind": "float64"
                },
                "sentCount": {
                  "kind": "float64"
                },
                "trashCount": {
                  "kind": "float64"
                }
              }
            }
          ]
        }
      },
      "SendMail": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "to": {
              "kind": "string"
            },
            "subject": {
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
                "kind": "struct",
                "fields": {
                  "id": {
                    "kind": "string"
                  },
                  "sender": {
                    "kind": "string"
                  },
                  "senderName": {
                    "kind": "string"
                  },
                  "senderAddress": {
                    "kind": "string"
                  },
                  "recipient": {
                    "kind": "string"
                  },
                  "subject": {
                    "kind": "string"
                  },
                  "body": {
                    "kind": "string"
                  },
                  "timestamp": {
                    "kind": "float64"
                  },
                  "read": {
                    "kind": "bool"
                  },
                  "folder": {
                    "kind": "string"
                  },
                  "starred": {
                    "kind": "bool"
                  }
                }
              }
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
      "MarkMailRead": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "ids": {
              "kind": "array",
              "value": {
                "kind": "string"
              }
            },
            "read": {
              "kind": "bool"
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
        }
      },
      "ToggleMailStar": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "id": {
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
      "DeleteMail": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "ids": {
              "kind": "array",
              "value": {
                "kind": "string"
              }
            },
            "permanent": {
              "kind": "optional",
              "value": {
                "kind": "bool"
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
        }
      },
      "MailChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "string"
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      }
    },
    "MapService": {
      "GetMapData": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {}
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
                  "name": {
                    "kind": "string"
                  },
                  "category": {
                    "kind": "string"
                  },
                  "x": {
                    "kind": "float64"
                  },
                  "y": {
                    "kind": "float64"
                  },
                  "address": {
                    "kind": "string"
                  },
                  "icon": {
                    "kind": "string"
                  }
                }
              }
            },
            {
              "kind": "array",
              "value": {
                "kind": "struct",
                "fields": {
                  "playerId": {
                    "kind": "float64"
                  },
                  "name": {
                    "kind": "string"
                  },
                  "x": {
                    "kind": "float64"
                  },
                  "y": {
                    "kind": "float64"
                  },
                  "heading": {
                    "kind": "float64"
                  }
                }
              }
            },
            {
              "kind": "optional",
              "value": {
                "kind": "struct",
                "fields": {
                  "x": {
                    "kind": "float64"
                  },
                  "y": {
                    "kind": "float64"
                  },
                  "label": {
                    "kind": "string"
                  },
                  "distance": {
                    "kind": "optional",
                    "value": {
                      "kind": "float64"
                    }
                  }
                }
              }
            }
          ]
        }
      },
      "SetWaypoint": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "x": {
              "kind": "float64"
            },
            "y": {
              "kind": "float64"
            },
            "label": {
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
                "kind": "struct",
                "fields": {
                  "x": {
                    "kind": "float64"
                  },
                  "y": {
                    "kind": "float64"
                  },
                  "label": {
                    "kind": "string"
                  },
                  "distance": {
                    "kind": "optional",
                    "value": {
                      "kind": "float64"
                    }
                  }
                }
              }
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
      "ClearWaypoint": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {}
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
      "WaypointChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "optional",
              "value": {
                "kind": "struct",
                "fields": {
                  "x": {
                    "kind": "float64"
                  },
                  "y": {
                    "kind": "float64"
                  },
                  "label": {
                    "kind": "string"
                  },
                  "distance": {
                    "kind": "optional",
                    "value": {
                      "kind": "float64"
                    }
                  }
                }
              }
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      }
    },
    "MusicService": {
      "GetMusicLibrary": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {}
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
                  "title": {
                    "kind": "string"
                  },
                  "artist": {
                    "kind": "string"
                  },
                  "album": {
                    "kind": "string"
                  },
                  "duration": {
                    "kind": "float64"
                  },
                  "coverColor": {
                    "kind": "string"
                  },
                  "station": {
                    "kind": "optional",
                    "value": {
                      "kind": "string"
                    }
                  }
                }
              }
            },
            {
              "kind": "struct",
              "fields": {
                "track": {
                  "kind": "optional",
                  "value": {
                    "kind": "struct",
                    "fields": {
                      "id": {
                        "kind": "string"
                      },
                      "title": {
                        "kind": "string"
                      },
                      "artist": {
                        "kind": "string"
                      },
                      "album": {
                        "kind": "string"
                      },
                      "duration": {
                        "kind": "float64"
                      },
                      "coverColor": {
                        "kind": "string"
                      },
                      "station": {
                        "kind": "optional",
                        "value": {
                          "kind": "string"
                        }
                      }
                    }
                  }
                },
                "isPlaying": {
                  "kind": "bool"
                },
                "position": {
                  "kind": "float64"
                },
                "volume": {
                  "kind": "float64"
                },
                "loop": {
                  "kind": "bool"
                },
                "shuffle": {
                  "kind": "bool"
                }
              }
            }
          ]
        }
      },
      "PlayTrack": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "trackId": {
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
                "kind": "struct",
                "fields": {
                  "track": {
                    "kind": "optional",
                    "value": {
                      "kind": "struct",
                      "fields": {
                        "id": {
                          "kind": "string"
                        },
                        "title": {
                          "kind": "string"
                        },
                        "artist": {
                          "kind": "string"
                        },
                        "album": {
                          "kind": "string"
                        },
                        "duration": {
                          "kind": "float64"
                        },
                        "coverColor": {
                          "kind": "string"
                        },
                        "station": {
                          "kind": "optional",
                          "value": {
                            "kind": "string"
                          }
                        }
                      }
                    }
                  },
                  "isPlaying": {
                    "kind": "bool"
                  },
                  "position": {
                    "kind": "float64"
                  },
                  "volume": {
                    "kind": "float64"
                  },
                  "loop": {
                    "kind": "bool"
                  },
                  "shuffle": {
                    "kind": "bool"
                  }
                }
              }
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
      "TogglePlayback": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {}
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
                "kind": "struct",
                "fields": {
                  "track": {
                    "kind": "optional",
                    "value": {
                      "kind": "struct",
                      "fields": {
                        "id": {
                          "kind": "string"
                        },
                        "title": {
                          "kind": "string"
                        },
                        "artist": {
                          "kind": "string"
                        },
                        "album": {
                          "kind": "string"
                        },
                        "duration": {
                          "kind": "float64"
                        },
                        "coverColor": {
                          "kind": "string"
                        },
                        "station": {
                          "kind": "optional",
                          "value": {
                            "kind": "string"
                          }
                        }
                      }
                    }
                  },
                  "isPlaying": {
                    "kind": "bool"
                  },
                  "position": {
                    "kind": "float64"
                  },
                  "volume": {
                    "kind": "float64"
                  },
                  "loop": {
                    "kind": "bool"
                  },
                  "shuffle": {
                    "kind": "bool"
                  }
                }
              }
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
      "NextTrack": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {}
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
                "kind": "struct",
                "fields": {
                  "track": {
                    "kind": "optional",
                    "value": {
                      "kind": "struct",
                      "fields": {
                        "id": {
                          "kind": "string"
                        },
                        "title": {
                          "kind": "string"
                        },
                        "artist": {
                          "kind": "string"
                        },
                        "album": {
                          "kind": "string"
                        },
                        "duration": {
                          "kind": "float64"
                        },
                        "coverColor": {
                          "kind": "string"
                        },
                        "station": {
                          "kind": "optional",
                          "value": {
                            "kind": "string"
                          }
                        }
                      }
                    }
                  },
                  "isPlaying": {
                    "kind": "bool"
                  },
                  "position": {
                    "kind": "float64"
                  },
                  "volume": {
                    "kind": "float64"
                  },
                  "loop": {
                    "kind": "bool"
                  },
                  "shuffle": {
                    "kind": "bool"
                  }
                }
              }
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
      "PreviousTrack": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {}
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
                "kind": "struct",
                "fields": {
                  "track": {
                    "kind": "optional",
                    "value": {
                      "kind": "struct",
                      "fields": {
                        "id": {
                          "kind": "string"
                        },
                        "title": {
                          "kind": "string"
                        },
                        "artist": {
                          "kind": "string"
                        },
                        "album": {
                          "kind": "string"
                        },
                        "duration": {
                          "kind": "float64"
                        },
                        "coverColor": {
                          "kind": "string"
                        },
                        "station": {
                          "kind": "optional",
                          "value": {
                            "kind": "string"
                          }
                        }
                      }
                    }
                  },
                  "isPlaying": {
                    "kind": "bool"
                  },
                  "position": {
                    "kind": "float64"
                  },
                  "volume": {
                    "kind": "float64"
                  },
                  "loop": {
                    "kind": "bool"
                  },
                  "shuffle": {
                    "kind": "bool"
                  }
                }
              }
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
      "SetVolume": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "volume": {
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
        }
      },
      "SeekTrack": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "position": {
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
        }
      },
      "PlaybackChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "struct",
              "fields": {
                "track": {
                  "kind": "optional",
                  "value": {
                    "kind": "struct",
                    "fields": {
                      "id": {
                        "kind": "string"
                      },
                      "title": {
                        "kind": "string"
                      },
                      "artist": {
                        "kind": "string"
                      },
                      "album": {
                        "kind": "string"
                      },
                      "duration": {
                        "kind": "float64"
                      },
                      "coverColor": {
                        "kind": "string"
                      },
                      "station": {
                        "kind": "optional",
                        "value": {
                          "kind": "string"
                        }
                      }
                    }
                  }
                },
                "isPlaying": {
                  "kind": "bool"
                },
                "position": {
                  "kind": "float64"
                },
                "volume": {
                  "kind": "float64"
                },
                "loop": {
                  "kind": "bool"
                },
                "shuffle": {
                  "kind": "bool"
                }
              }
            }
          ]
        },
        "direction": "server",
        "reliability": "reliable"
      }
    },
    "GarageService": {
      "GetVehicles": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {}
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
                  "plate": {
                    "kind": "string"
                  },
                  "model": {
                    "kind": "string"
                  },
                  "label": {
                    "kind": "string"
                  },
                  "category": {
                    "kind": "string"
                  },
                  "garage": {
                    "kind": "string"
                  },
                  "status": {
                    "kind": "string"
                  },
                  "fuel": {
                    "kind": "float64"
                  },
                  "engineHealth": {
                    "kind": "float64"
                  },
                  "bodyHealth": {
                    "kind": "float64"
                  },
                  "isLocked": {
                    "kind": "bool"
                  },
                  "engineOn": {
                    "kind": "bool"
                  },
                  "x": {
                    "kind": "float64"
                  },
                  "y": {
                    "kind": "float64"
                  }
                }
              }
            }
          ]
        }
      },
      "ToggleLock": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "plate": {
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
                "kind": "bool"
              }
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
      "ToggleEngine": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "plate": {
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
                "kind": "bool"
              }
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
      "RequestValet": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "plate": {
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
                "kind": "struct",
                "fields": {
                  "id": {
                    "kind": "string"
                  },
                  "plate": {
                    "kind": "string"
                  },
                  "model": {
                    "kind": "string"
                  },
                  "label": {
                    "kind": "string"
                  },
                  "category": {
                    "kind": "string"
                  },
                  "garage": {
                    "kind": "string"
                  },
                  "status": {
                    "kind": "string"
                  },
                  "fuel": {
                    "kind": "float64"
                  },
                  "engineHealth": {
                    "kind": "float64"
                  },
                  "bodyHealth": {
                    "kind": "float64"
                  },
                  "isLocked": {
                    "kind": "bool"
                  },
                  "engineOn": {
                    "kind": "bool"
                  },
                  "x": {
                    "kind": "float64"
                  },
                  "y": {
                    "kind": "float64"
                  }
                }
              }
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
      "TrackVehicle": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "plate": {
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
                "kind": "struct",
                "fields": {
                  "x": {
                    "kind": "float64"
                  },
                  "y": {
                    "kind": "float64"
                  },
                  "label": {
                    "kind": "string"
                  }
                }
              }
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
      "VehicleStateChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "struct",
              "fields": {
                "id": {
                  "kind": "string"
                },
                "plate": {
                  "kind": "string"
                },
                "model": {
                  "kind": "string"
                },
                "label": {
                  "kind": "string"
                },
                "category": {
                  "kind": "string"
                },
                "garage": {
                  "kind": "string"
                },
                "status": {
                  "kind": "string"
                },
                "fuel": {
                  "kind": "float64"
                },
                "engineHealth": {
                  "kind": "float64"
                },
                "bodyHealth": {
                  "kind": "float64"
                },
                "isLocked": {
                  "kind": "bool"
                },
                "engineOn": {
                  "kind": "bool"
                },
                "x": {
                  "kind": "float64"
                },
                "y": {
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
    "SocialService": {
      "GetFeed": {
        "kind": "method",
        "request": {
          "kind": "optional",
          "value": {
            "kind": "struct",
            "fields": {
              "tag": {
                "kind": "optional",
                "value": {
                  "kind": "string"
                }
              },
              "query": {
                "kind": "optional",
                "value": {
                  "kind": "string"
                }
              }
            }
          }
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
                  "author": {
                    "kind": "struct",
                    "fields": {
                      "id": {
                        "kind": "string"
                      },
                      "name": {
                        "kind": "string"
                      },
                      "handle": {
                        "kind": "string"
                      },
                      "avatar": {
                        "kind": "string"
                      },
                      "verified": {
                        "kind": "bool"
                      }
                    }
                  },
                  "content": {
                    "kind": "string"
                  },
                  "timestamp": {
                    "kind": "float64"
                  },
                  "likes": {
                    "kind": "float64"
                  },
                  "retweets": {
                    "kind": "float64"
                  },
                  "replies": {
                    "kind": "float64"
                  },
                  "liked": {
                    "kind": "bool"
                  },
                  "retweeted": {
                    "kind": "bool"
                  },
                  "hashtags": {
                    "kind": "array",
                    "value": {
                      "kind": "string"
                    }
                  }
                }
              }
            }
          ]
        }
      },
      "CreatePost": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "content": {
              "kind": "string"
            },
            "hashtags": {
              "kind": "optional",
              "value": {
                "kind": "array",
                "value": {
                  "kind": "string"
                }
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
                "kind": "struct",
                "fields": {
                  "id": {
                    "kind": "string"
                  },
                  "author": {
                    "kind": "struct",
                    "fields": {
                      "id": {
                        "kind": "string"
                      },
                      "name": {
                        "kind": "string"
                      },
                      "handle": {
                        "kind": "string"
                      },
                      "avatar": {
                        "kind": "string"
                      },
                      "verified": {
                        "kind": "bool"
                      }
                    }
                  },
                  "content": {
                    "kind": "string"
                  },
                  "timestamp": {
                    "kind": "float64"
                  },
                  "likes": {
                    "kind": "float64"
                  },
                  "retweets": {
                    "kind": "float64"
                  },
                  "replies": {
                    "kind": "float64"
                  },
                  "liked": {
                    "kind": "bool"
                  },
                  "retweeted": {
                    "kind": "bool"
                  },
                  "hashtags": {
                    "kind": "array",
                    "value": {
                      "kind": "string"
                    }
                  }
                }
              }
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
      "ToggleLike": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "postId": {
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
                "kind": "bool"
              }
            },
            {
              "kind": "optional",
              "value": {
                "kind": "float64"
              }
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
      "ToggleRetweet": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "postId": {
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
                "kind": "bool"
              }
            },
            {
              "kind": "optional",
              "value": {
                "kind": "float64"
              }
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
      "DeletePost": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "postId": {
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
        }
      },
      "PostCreated": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "struct",
              "fields": {
                "id": {
                  "kind": "string"
                },
                "author": {
                  "kind": "struct",
                  "fields": {
                    "id": {
                      "kind": "string"
                    },
                    "name": {
                      "kind": "string"
                    },
                    "handle": {
                      "kind": "string"
                    },
                    "avatar": {
                      "kind": "string"
                    },
                    "verified": {
                      "kind": "bool"
                    }
                  }
                },
                "content": {
                  "kind": "string"
                },
                "timestamp": {
                  "kind": "float64"
                },
                "likes": {
                  "kind": "float64"
                },
                "retweets": {
                  "kind": "float64"
                },
                "replies": {
                  "kind": "float64"
                },
                "liked": {
                  "kind": "bool"
                },
                "retweeted": {
                  "kind": "bool"
                },
                "hashtags": {
                  "kind": "array",
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
      },
      "PostUpdated": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "struct",
              "fields": {
                "id": {
                  "kind": "string"
                },
                "author": {
                  "kind": "struct",
                  "fields": {
                    "id": {
                      "kind": "string"
                    },
                    "name": {
                      "kind": "string"
                    },
                    "handle": {
                      "kind": "string"
                    },
                    "avatar": {
                      "kind": "string"
                    },
                    "verified": {
                      "kind": "bool"
                    }
                  }
                },
                "content": {
                  "kind": "string"
                },
                "timestamp": {
                  "kind": "float64"
                },
                "likes": {
                  "kind": "float64"
                },
                "retweets": {
                  "kind": "float64"
                },
                "replies": {
                  "kind": "float64"
                },
                "liked": {
                  "kind": "bool"
                },
                "retweeted": {
                  "kind": "bool"
                },
                "hashtags": {
                  "kind": "array",
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
    },
    "AppStoreService": {
      "GetStoreCatalog": {
        "kind": "method",
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
                  "name": {
                    "kind": "string"
                  },
                  "category": {
                    "kind": "string"
                  },
                  "developer": {
                    "kind": "string"
                  },
                  "rating": {
                    "kind": "float64"
                  },
                  "reviewsCount": {
                    "kind": "float64"
                  },
                  "sizeMb": {
                    "kind": "float64"
                  },
                  "description": {
                    "kind": "string"
                  },
                  "version": {
                    "kind": "string"
                  },
                  "isSystem": {
                    "kind": "bool"
                  }
                }
              }
            }
          ]
        },
        "request": {
          "kind": "struct",
          "fields": {}
        }
      },
      "GetInstalledApps": {
        "kind": "method",
        "response": {
          "kind": "tuple",
          "items": [
            {
              "kind": "array",
              "value": {
                "kind": "string"
              }
            }
          ]
        },
        "request": {
          "kind": "struct",
          "fields": {}
        }
      },
      "InstallApp": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "appId": {
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
                "kind": "array",
                "value": {
                  "kind": "string"
                }
              }
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
      "UninstallApp": {
        "kind": "method",
        "request": {
          "kind": "struct",
          "fields": {
            "appId": {
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
                "kind": "array",
                "value": {
                  "kind": "string"
                }
              }
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
      "InstalledAppsChanged": {
        "kind": "signal",
        "arguments": {
          "kind": "tuple",
          "items": [
            {
              "kind": "array",
              "value": {
                "kind": "string"
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
