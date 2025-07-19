import * as ChatRenderer from './ChatRenderer';
import { Listener } from './listener';

export const MODULE_ID = 'discord-to-fvtt';
export const log = (message, ...args) => console.log(MODULE_ID, '|', message, ...args);

let listener;

Hooks.once('setup', () => {
  game.settings.register(MODULE_ID, 'discordGuildId', {
    name: 'Discord Server ID',
    hint: 'Enter your Discord server ID.',
    config: true,
    requiresReload: false,
    scope: 'world',
    type: String
  });
  game.settings.register(MODULE_ID, 'discordChannelIds', {
    name: 'Discord Channel IDs',
    hint: 'Enter a list of channel ID filters, separated by commas. Leave this blank to relay all accessible channels.',
    config: true,
    requiresReload: false,
    scope: 'world',
    type: String,
    onChange: (value) => (listener.acceptedChannels = value)
  });
  game.settings.register(MODULE_ID, 'discordToken', {
    name: 'Discord Token',
    hint: 'Enter your Discord bot token if you want to use your own bot.',
    config: true,
    requiresReload: false,
    scope: 'world',
    type: String,
    onChange: (value) => (listener.token = value)
  });
  game.settings.register(MODULE_ID, 'preserveDeletedMessages', {
    name: 'Preserve Messages',
    hint: 'Should deleted messages be preserved in the chat log (with a strike-through)?',
    config: true,
    requiresReload: false,
    scope: 'world',
    type: Boolean
  });

  ChatRenderer.setup().catch((err) => console.error(MODULE_ID, { error: err }));
  listener = new Listener();
});

Hooks.once('ready', () => {
  if (!game.users.activeGM.isSelf) return;
  listener.token = game.settings.get(MODULE_ID, 'discordToken');
});

const userConfigSectionBySystem = {
  'default': 'section.window-content > div footer',
  'pf2e': 'section.tab[data-tab=core] > div footer',
  'pirateborg': 'section.window-content > div fieldset:last-child'
};

Hooks.on('renderUserConfig', (app, html) => {
  const did = app.document.flags[MODULE_ID]?.did ?? '';
  const input = `
    <fieldset>
      <legend>${game.i18n.localize(`${MODULE_ID}.name`)}</legend>
      <div class='form-group'>
        <div class='form-fields'>
          <input type='text' name='flags.${MODULE_ID}.did' value='${did}' placeholder='Discord User ID'>
        </div>
        <p class='hint'>${game.i18n.localize(`${MODULE_ID}.userConfigurationHint`)}</p>
      </div>
    </fieldset>`;
  html.querySelector(userConfigSectionBySystem[game.system.id] ?? userConfigSectionBySystem.default).insertAdjacentHTML('beforebegin', input);
});
