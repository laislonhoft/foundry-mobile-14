# Foundry Mobile 14

[Leia em português](README.md)

A Foundry VTT 14 module with touch-friendly arrows for token movement, gestures for navigating the map, and layout adjustments for phones. Mobile mode turns on automatically when the browser reports a touchscreen. To change the mode for the current browser, open **Game Settings → Configure Settings → Foundry Mobile 14**.

The module follows Foundry's selected language and supports English and Brazilian Portuguese.

## Installation

In the Foundry setup screen, open **Add-on Modules → Install Module** and paste the [manifest link](https://github.com/laislonhoft/foundry-mobile-14/releases/latest/download/module.json) into the **Manifest URL** field. Then enable **Foundry Mobile 14** in your world under **Manage Modules**.

For manual installation, download the ZIP from the [releases page](https://github.com/laislonhoft/foundry-mobile-14/releases) and follow these steps.

1. Extract the `foundry-mobile-14` folder from the ZIP into `Data/modules/` in the server's user data folder. The manifest should be at `Data/modules/foundry-mobile-14/module.json`.
2. Restart Foundry, launch your world, and enable **Foundry Mobile 14** under **Manage Modules** as the GM.
3. Open the usual world address on your phone and sign in as a player. Use an active scene and a player account with Owner permission on the token.

## Controls

- **Move** opens the eight direction arrows and the center button. Select your token on the canvas using Foundry's selection tool, then tap an arrow. Each tap uses Foundry's native keyboard movement. The center button pans to the first selected token.
- **Navigate** switches to camera mode. Drag with one finger to pan and pinch with two fingers to zoom. Tap **Play** to select tokens and interact with the scene again.
- **− / +** adjust map zoom. **Sidebar** opens or closes Foundry's sidebar.
- The module constrains window dimensions on small screens and sets form text to at least 16 pixels. Character sheets with fixed-width layouts may need adjustments for your game system.

## Testing in your world

1. Join as a player on a phone. Select your token and test the movement arrows. Try a step into a wall and check the result from the GM's browser.
2. Try moving another player's token, moving a locked token, and moving while the game is paused.
3. Pan and pinch the map. Switch back to **Play** and try selecting a token or interacting with a door. Change scenes and repeat.
4. Open chat and a character sheet in portrait and landscape. Check that you can scroll the sheet, type in chat, and close the window with the on-screen keyboard open.
5. Open the world on a desktop with automatic mode selected and check that the regular controls work as usual.

This version uses the Foundry VTT 14 API. Browser tests use a simulated Foundry environment. Testing with a live world on Android or iPhone is pending.
