# EchoDeck product design

**Tagline:** Press a sound. Make it yours. Bring it back.

> **Implementation status:** The current repository is a local streamer prototype with a Twitch Panel Extension Local Test path. Sound profiles remain in IndexedDB; the dev service syncs the local catalog/audio into memory and routes authenticated viewer requests plus streamer playback through one queue to the OBS source. Twitch OAuth, Extension review/release, follower/subscriber verification, hosted accounts, payments, and cloud audio storage are not connected. See the [local Extension setup](web/docs/viewer-extension-local-test.md) and [technical implementation](web/docs/technical-implementation.md).

## The idea

EchoDeck is a digital soundboard for Twitch streamers. Streamers build pages of buzzer buttons and play sounds with a click, a keyboard key, or an optional physical keypad. Viewers can open the streamer’s public EchoDeck panel and trigger sounds on the stream.

EchoDeck also lets a streamer try to copy a sound up to three times total: the first attempt plus two retries. The original and each take appear as waveforms, with a playful score. After the final take, the streamer chooses one take to keep as the official version. The takes stay private unless the streamer adds the chosen take to a deck or chooses to publish it in the marketplace.

The marketplace lets creators share individual sounds and, later, packs. Creators decide whether their listings are free or paid. A streamer’s voice appears there only when that streamer chooses to publish it.

## Why make it

Streamers already use sound buttons for quick reactions. EchoDeck gives them a digital deck they can shape around their channel, lets viewers join in without asking the streamer to approve every sound, and turns streamer-made impressions into sounds the community can replay.

## Who it is for

### Streamers

EchoDeck is for Twitch streamers whose shows can use quick sound effects and community participation: variety and gaming streamers, Just Chatting hosts, reaction and comedy creators, and character-led streamers.

Streamers choose what is in their deck, what viewers can trigger, and what recordings they share. They can use EchoDeck on screen, with keyboard keys, or with an optional physical keypad such as a Stream Deck.

### Viewers

Viewers can browse the sounds the streamer has made public, trigger an allowed sound, and watch the streamer try a Mimic Challenge. They can choose the original sound or the streamer’s version when both are available.

### Sound creators

Sound creators and streamers can publish recordings in the marketplace. They control whether a sound is listed, whether it is free or paid, and what use they allow.

## Approaches considered

### Sound deck first, with challenges and a marketplace

The streamer opens My Deck and sees the buzzer grid. Mimic Challenge creates new sounds for the deck, and the marketplace is where streamers find more. This matches the reference images and makes the sound buttons the everyday tool. **This is the chosen direction.**

### Marketplace first

The streamer opens a store, browses creators’ sounds, and then builds a deck from them. This makes creator discovery central, but depends on having a large, well-managed catalog from the start.

### Challenge first

The streamer opens on a Mimic Challenge. The performance and its history are central, while the deck is where saved takes go. This makes the product feel more like a live game and makes the soundboard less prominent.

## The product’s main parts

### What each person uses

EchoDeck has three connected parts because streamers and viewers use it in different places:

- **Streamer web app:** The streamer’s home for My Deck, their sound library, the marketplace, Mimic Challenge history, and channel settings. During a live stream, the streamer can play sounds from this app using a click, keyboard key, or optional physical keypad.
- **Viewer Panel Extension:** A small EchoDeck panel below the Twitch video. Viewers browse the sounds the streamer has made available, choose the original or streamer take when both are offered, and press a buzzer to request a sound.
- **Stream audio source:** The streamer adds EchoDeck’s browser source to their broadcasting setup. It receives allowed sound requests and plays the sound into the broadcast, so it is heard in the live video. The viewer panel sends the request; it is not the broadcast’s sound player. The browser source can also show a small on-stream visual response, such as which sound was played.

The viewer panel is for audience interaction. The web app is where the streamer manages EchoDeck. The browser source connects an approved sound to the stream. Together, these make EchoDeck feel like one product across Twitch, the streamer’s browser, and the broadcast.

### Streamer experience

1. The streamer opens the EchoDeck web app and connects their Twitch channel.
2. They build My Deck by adding sounds from their library or the marketplace, then arrange the sounds into pages of ten buttons.
3. They choose which sounds viewers may request, whether requests are for followers or subscribers, and the channel and per-viewer rate limits.
4. They add EchoDeck’s Panel Extension to their Twitch channel so viewers can browse and request those sounds.
5. They add the EchoDeck browser source to their broadcast setup, then test that a sound request plays in the stream.
6. While live, they play sounds from My Deck with a click, keyboard key, or optional keypad. Viewer requests follow the same sound rules and rate limits.
7. When they want to create a streamer version of a sound, they start a Mimic Challenge, make up to three takes, and choose one official take to keep.

The streamer can pause viewer requests or disable them entirely at any time. Their web app remains the place to manage their sounds, pages, challenge history, and sharing choices.

### Viewer experience

1. The viewer opens the EchoDeck panel below the streamer’s Twitch video.
2. They see only the sounds the streamer has made available to viewers.
3. If both versions are offered, they choose the original sound or the streamer’s take.
4. They press the sound’s buzzer. If they meet the streamer’s follower or subscriber rule and are within the rate limits, the request is accepted.
5. The streamer’s broadcast source plays the sound into the live stream. The viewer sees a clear result in the panel; the stream may also show a small visual response.
6. If the viewer is not eligible or has reached a limit, the panel explains why and shows the wait time when applicable. The request is rejected, not queued.

Viewers do not need a separate EchoDeck account to play a sound. The panel should explain when Twitch sign-in or an access check is needed. Viewer playback is free, and the streamer does not have to approve each request.

### Sound creator experience

Sound creators use the EchoDeck web app to publish individual sounds to the marketplace. For each listing, they choose whether it is free or paid and what uses they allow. Streamers can preview a listing, review its creator and use terms, and add it to their library. A streamer’s own voice appears in the marketplace only when they choose to publish that specific take.

### My Deck

My Deck is the streamer’s soundboard. The home screen shows ten large, round buzzer buttons at once. Each button has its sound name below it.

- Clicking a buzzer plays that sound on the stream.
- Clicking the sound name opens its detail page.
- Keys `1` through `9` and `0` play the ten sounds on the current page.
- The left and right arrows move between pages. `A` and `D` can also move between pages.
- A right-page change slides the next page in from the right.
- The streamer can change button names, positions, and colors, and give pages names such as “Reactions” or “Chat favorites.”
- A physical keypad is optional. The on-screen deck and keyboard controls work without one.

The **library** holds sounds the streamer has collected. The **deck** is the smaller set arranged for quick use. A sound can stay in the library without taking up a button on the current page.

Keep ten sounds per page, but do not cap the size of the library or charge for more pages. Streamers can make additional pages when they need them.

### Sound details

Clicking a sound’s name opens a page with:

- A large buzzer that plays a preview
- The sound’s name and a short description
- The creator or performer
- A waveform with simple play controls
- The original and streamer versions, when both exist
- The sound’s category and use terms
- An **Add to My Library** or **Add to My Deck** button
- Favorite, share, and report controls

On a marketplace card, clicking the buzzer previews the sound. Clicking the name opens this detail page. The plus button adds it to the streamer’s library. The streamer then chooses which deck page and button to use.

### Mimic Challenge

Mimic Challenge gives a streamer up to three total takes for each sound: one first attempt and two retries.

1. The streamer opens a sound’s detail page and chooses **Start Mimic Challenge**.
2. The streamer hears the original. The prompt appears on stream so viewers can follow.
3. The streamer records a take. EchoDeck shows the original and the new take as waveforms and gives the take a playful score.
4. The streamer can retry, up to two more times for that sound. Each take is kept in private challenge history, including missed or funny attempts.
5. After the last take, EchoDeck asks the streamer to choose their favorite take as the official version. The streamer cannot make more takes for that sound after choosing.
6. The streamer can name the chosen take, choose its button look, and add it to My Deck.
7. The streamer can separately choose to publish the chosen take in the marketplace. Other takes remain private.

All takes stay in the streamer’s private challenge history. The streamer chooses one take as the official version after using up to three total attempts. Only that chosen take can be added to a public deck or marketplace listing. The streamer can remove it from public view later, while the private history keeps the attempts and final choice.

### Marketplace

The marketplace is a grid inspired by the reference screenshots: clear buzzer art, sound names, and a plus button to add an item.

For the first version, marketplace listings are individual sounds. Sound packs can come later. A listing can be free or paid, as its creator chooses.

Marketplace cards show the sound name, buzzer image, creator, category, and price or free label. The plus button adds the sound to My Library. The sound’s name opens its detail page, where the streamer can preview the audio, compare original and streamer versions, read the description and use terms, and add the sound to a deck.

Streamers’ recordings appear in the marketplace only when the streamer opts in to publish that recording. A general voice-sharing setting is not enough to publish every recording automatically.

## Streamer flow

### Set up

1. The streamer opens the EchoDeck web app and connects it to their Twitch channel.
2. They add the EchoDeck Panel Extension to their channel for viewer sound requests.
3. They add the EchoDeck browser source to their broadcasting setup and test that it can play a sound into the stream.
4. They add sounds from the marketplace or make their own.
5. They put sounds in My Deck, arrange them on pages of ten, and assign keys if they want.
6. For each sound, they choose whether it is private, public to viewers, or available for marketplace sharing.
7. They set follower/subscriber access and limits for viewer-triggered sounds.

### Play a sound live

1. The streamer opens My Deck.
2. They click a buzzer or press its assigned key.
3. EchoDeck sends the sound to the stream audio source, which plays it into the broadcast.

### Make a new take

1. The streamer picks a sound and starts its Mimic Challenge.
2. They hear the sound and record a take while viewers watch.
3. EchoDeck shows its waveform and playful score. The streamer can retry up to two more times.
4. Each take is saved in private challenge history. After the third total take, the streamer chooses one as the official version.
5. The streamer can put the chosen take on My Deck and choose whether to publish it.

## Viewer flow

### Open the channel deck

Viewers open EchoDeck from a Panel Extension below the Twitch video. They see the sounds the streamer has made public. During a challenge or playback, a small display on the stream can show what is happening.

### Trigger a sound

1. The viewer finds a sound in the panel.
2. If both are available, they choose **Original** or **Streamer’s Take**.
3. They press **Play**.
4. If the sound is allowed and within the channel’s limits, the request goes to the streamer’s browser source, which plays it into the live stream.
5. If a limit has been reached, EchoDeck rejects the request and shows the viewer how long to wait. It does not hold the request in a queue.

Viewers play sounds for free. The streamer does not approve each request. The streamer can pause viewer sounds or turn them off for selected sounds. Viewers do not need a separate EchoDeck account, though Twitch sign-in or an access check may be required for follower/subscriber-only sounds.

## Viewer sound limits

The streamer can set two separate limits:

- **Channel limit:** How many sounds the whole audience can trigger in a chosen time period, such as two sounds every five seconds.
- **Per-viewer wait:** How long one viewer must wait before triggering another sound.

The streamer can adjust both limits, pause requests, or turn viewer playback off. When someone reaches a limit, EchoDeck rejects that request and displays the wait time. It never plays the request later without the viewer asking again.

The example numbers are starting points, not fixed rules. Exact choices and safe defaults are left for the product builder to set after trying the flow.

## Screen layout

### Streamer web app

- My Deck is the main screen, with ten buzzer buttons per page, page controls, and assigned keys.
- The library and marketplace help the streamer find, preview, and organize sounds.
- Sound details show the creator, description, waveform, versions, and use terms.
- Mimic Challenge shows each take against the original, its playful score, and the final-take selection.
- Channel settings control viewer access, rate limits, sound availability, and the browser source setup.

### Twitch viewer panel

- A compact panel below the Twitch video, designed around tappable buzzer buttons.
- Each sound has a clear name and indicates whether the original, streamer take, or both are available.
- The panel shows whether a request was accepted, paused, unavailable, or limited, including the wait time.
- The panel stays focused on playing sounds; it does not contain the streamer’s full deck editor or creator marketplace tools.

### Stream audio source

- A browser source that plays accepted viewer requests and the streamer’s own deck sounds into the broadcast.
- It can show a brief visual confirmation, such as the sound name or buzzer, then return to a quiet/transparent state.
- The streamer can test it and find its setup instructions from the EchoDeck web app.

### My Deck

- Dark background with bright, round buzzers
- Ten sound buttons on each page, with the name underneath
- Page arrows and a page indicator
- The assigned keyboard key shown on each button
- Clicking the buzzer plays; clicking the name opens details

### Sound detail page

- Large buzzer and sound name
- Creator, description, and use terms
- Waveform and audio preview
- Original and streamer versions when available
- Add to library or deck, favorite, share, and report actions
- **Start Mimic Challenge** when the sound can be copied

### Marketplace

- Search and category filters
- Sound cards with buzzer, name, creator, price, and plus button
- Clicking a buzzer previews; clicking a name opens details
- Detail page shows waveform, versions, creator information, and use terms

### Viewer panel

- Public sounds displayed as buzzer buttons
- Original or streamer version choice when both exist
- Play button and current cooldown or availability message
- Challenge prompt and result while a Mimic Challenge is live

## Goals

- Let streamers trigger sounds quickly while they are live.
- Give viewers a simple way to bring a sound into the stream.
- Let a streamer make up to three takes per sound, then choose one official version.
- Give streamers control over what they play, what viewers can play, and what they share.
- Let sound creators choose whether their work is free or paid.

## Not in the first version

- Charging viewers to trigger sounds
- Streamer approval for every viewer request
- Playing viewer requests later from a queue
- Charging streamers for extra deck pages
- Bundled sound packs or creator storefronts
- A huge built-in library
- Automatically publishing a streamer’s voice
- Unlimited attempts for the same challenge sound

## Constraints

- EchoDeck must be shown working with Twitch for the hackathon.
- The first demo should not depend on marketplace payments or a large catalog.
- Only original or properly licensed sounds should ship in the sample catalog.
- The interface should make it clear which version is playing and who made it.
- The public marketplace version of a streamer’s voice requires that streamer’s choice for that specific recording.
- Viewer sound requests are made in the Twitch Panel Extension; the streamer’s browser source plays accepted sounds into the broadcast.
- Any sound played directly inside the Extension must follow Twitch’s audio rules, including viewer volume controls and starting muted.

## Open for the builder

- The exact viewer-limit presets and allowed ranges
- The score name, score scale, and playful result labels
- The visual style of the buzzer art and waveforms
- How creators receive payment for paid listings
- The simplest dependable way to demonstrate EchoDeck on a live Twitch channel

## Final product statement

**EchoDeck is a Twitch sound product with three connected parts: a streamer web app for building and managing sound decks, a Twitch Panel Extension where viewers can request public sounds, and a browser source that plays accepted sounds into the live broadcast. Streamers play sounds with a click or key, and viewers can trigger public sounds for free under limits the streamer controls. A streamer can make up to three total mimic takes for a sound, with each take saved in private history and shown beside the original with a playful score. After the final take, the streamer chooses one official version to add to a deck or publish. The marketplace lets creators list individual sounds for free or for a price they choose.**
