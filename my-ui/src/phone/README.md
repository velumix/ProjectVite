# Roblox phone surface

This React surface is the Roblox adaptation boundary for the phone resource cloned to `C:\Users\TheRe\Desktop\phone`. The FiveM resource remains available there as the behavior reference. Roblox specific persistence, validation, methods, and signals live in `roblox/nerve/PhoneService.luau`; the browser preview mirrors that contract in `src/nerve/preview.ts`.

The source resource is GPL-3.0 licensed. This integration keeps the source checkout and its license files intact and implements the Roblox surface independently rather than copying its Vue components into the React bundle.
