import fs from 'fs';
import path from 'path';
import { User, ArtistProfile, Demo, Target, Outreach, Label } from './src/types.js';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface Schema {
  users: User[];
  artistProfiles: ArtistProfile[];
  demos: Demo[];
  targets: Target[];
  outreaches: Outreach[];
  labels?: Label[];
  userFavorites?: { [userId: string]: string[] }; // userId -> labelId[]
}

const SEED_LABELS: Label[] = [
  {
    id: 'label_1',
    name: 'Keinemusik',
    email: 'ar@keinemusik.com',
    website: 'https://keinemusik.com',
    instagram: '@keinemusikcrue',
    genre: 'Afro House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Legendary organic house and afro house collective. Blends organic percussion elements with modern deep-tech synth melodies.',
    bestFitDescription: 'Acoustic Afro House rhythms, spiritual vocals, subtle modular synthesis sweeps.',
    status: 'Open'
  },
  {
    id: 'label_2',
    name: 'Solid Grooves',
    email: 'demos@solidgrooves.co.uk',
    website: 'https://solidgrooves.co.uk',
    instagram: '@solidgrooves',
    genre: 'Minimal / Deep Tech',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Known for rolling tech-house and minimal-deep beats. Home of Pawsa, Michael Bibi.',
    bestFitDescription: 'Heavy MPC drum grooves, repetitive vocal cuts, minimal sub-bass driving sequences.',
    status: 'Open'
  },
  {
    id: 'label_3',
    name: 'Hot Creations',
    email: 'demos@hotcreations.com',
    website: 'https://hotcreations.com',
    instagram: '@hotcreations',
    genre: 'Tech House',
    region: 'Ibiza / Spain 🇪🇸',
    notes: 'Jamie Jones’ pioneer tech imprint. Curates melodic, high-energy peak-time club anthems.',
    bestFitDescription: 'Uplifting funky house beats, catchy vocal hooks, and analog synth lead configurations.',
    status: 'Open'
  },
  {
    id: 'label_4',
    name: 'Defected Records',
    email: 'demos@defected.com',
    website: 'https://defected.com',
    instagram: '@defectedrecords',
    genre: 'House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'The standard-bearer for traditional organic house. Heavy, soulful, and piano-driven.',
    bestFitDescription: 'Soulful vocals, bright piano chords, classic M1 synth basslines, upbeat grooves.',
    status: 'Open'
  },
  {
    id: 'label_5',
    name: 'Anjunadeep',
    email: 'submissions@anjunadeep.com',
    website: 'https://anjunadeep.com',
    instagram: '@anjunadeep',
    genre: 'Deep House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Lush, progressive deep house. Beautiful textures, ambient layers, and emotional compositions.',
    bestFitDescription: 'Atmospheric pad sweeps, delicate delay chords, deep warm bass, reflective melodic progressions.',
    status: 'Open'
  },
  {
    id: 'label_6',
    name: 'Innervisions',
    email: 'demos@innervisions.com',
    website: 'https://innervisions.com',
    instagram: '@innervisions_official',
    genre: 'Melodic House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Dixon & Åme’s boundary-pushing imprint. Artistic, structural, complex, and cinematic.',
    bestFitDescription: 'Intricate percussion grids, modular synthesizer arpeggios, progressive structures.',
    status: 'Open'
  },
  {
    id: 'label_7',
    name: 'Glitterbox',
    email: 'glitterbox@defected.com',
    website: 'https://glitterbox.co.uk',
    instagram: '@glitterboxibiza',
    genre: 'Disco House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Glamorous, classic, and golden-era vocal disco house tracks with live instrumentation style.',
    bestFitDescription: 'Live brass section samples, slap bass-guitar tracks, high energy tambourines.',
    status: 'Open'
  },
  {
    id: 'label_8',
    name: 'Crosstown Rebels',
    email: 'ar@crosstownrebels.com',
    website: 'https://crosstownrebels.com',
    instagram: '@crosstownrebels',
    genre: 'Electronic / Other',
    region: 'Ibiza / Spain 🇪🇸',
    notes: 'Damian Lazarus’ legendary underground house label. Heavy tribal, desert-vibe, and trippy dark rhythms.',
    bestFitDescription: 'Psychedelic sound effects, microtonal synth sequences, tribal/shamanic rhythms.',
    status: 'Open'
  },
  {
    id: 'label_9',
    name: 'Sola Records',
    email: 'submissions@solarecords.co.uk',
    website: 'https://solarecords.co.uk',
    instagram: '@solalive',
    genre: 'Tech House',
    region: 'Manchester, United Kingdom 🇬🇧',
    notes: 'Solardo’s high-energy direct imprint. Heavy snare buildup drums and direct peak club impact.',
    bestFitDescription: 'Loud crisp hats, resonant synth stabs, fast bassline drops, peak-time energy.',
    status: 'Open'
  },
  {
    id: 'label_10',
    name: 'Innervisions APAC',
    email: 'apac@innervisions.com',
    website: 'https://innervisions.com',
    instagram: '@innervisions_apac',
    genre: 'Melodic House',
    region: 'Tokyo, Japan 🇯🇵',
    notes: 'Eastern branch of the Innervisions sound. Atmospheric melodic house with classic elements.',
    bestFitDescription: 'Deep, spacious reverb pads, futuristic synth lines, elegant sub-heavy minimal grooves.',
    status: 'Open'
  },
  {
    id: 'label_11',
    name: 'Dogghouse Records',
    email: 'demos@mochakkdogghouse.com',
    website: 'https://dogghouse.co.br',
    instagram: '@dogghouse',
    genre: 'Minimal / Deep Tech',
    region: 'Rio de Janeiro, Brazil 🇧🇷',
    notes: 'Mochakk’s modern bouncy label. Blends deep-tech rolling rhythms with heavy swing-drum patterns.',
    bestFitDescription: 'MPC heavy swings, fast tech house bounciness, pitched down soul-music vocal clips.',
    status: 'Open'
  },
  {
    id: 'label_12',
    name: 'MoBlack Records',
    email: 'demos@moblack.com',
    website: 'https://moblack.com',
    instagram: '@moblackrecords',
    genre: 'Afro House',
    region: 'Milan, Italy 🇮🇹',
    notes: 'The absolute premier label in Afro House. Merges modern European and raw African instrumentation.',
    bestFitDescription: 'Organic woodblocks, live-recorded percussion loops, deep vocal chants, syncopated bass.',
    status: 'Open'
  },
  {
    id: 'label_13',
    name: 'Local Talk',
    email: 'demos@localtalk.se',
    website: 'https://localtalk.se',
    instagram: '@localtalk',
    genre: 'House',
    region: 'Stockholm, Sweden 🇸🇪',
    notes: 'Jazzy deep house label. Focuses on vintage feel, MPC sampling tricks, Rhodes chords, and pure soul.',
    bestFitDescription: 'Rhodes electric keyboard chords, jazzy sax or trumpet motifs, dusty MPC-60 drum vibes.',
    status: 'Open'
  },
  {
    id: 'label_14',
    name: 'DFTD Records',
    email: 'dftd@defected.com',
    website: 'https://defected.com/dftd',
    instagram: '@dftd',
    genre: 'Latin House',
    region: 'Barcelona, Spain 🇪🇸',
    notes: 'Specializes in high impact, energetic Latin groove elements, horn hooks, and tribal rhythms.',
    bestFitDescription: 'Nylon acoustic guitar riffs, lively horn arrangements, fast-paced polyrhythmic bongos.',
    status: 'Open'
  },
  {
    id: 'label_15',
    name: 'Ninja Tune',
    email: 'demos@ninjatune.net',
    website: 'https://ninjatune.net',
    instagram: '@ninjatune',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Pioneering avant-garde beat label. Left-field house, breakbeats, IDM, and highly custom sound designs.',
    bestFitDescription: 'Unique noise elements, breakbeat drums, highly experimental pitch-shifted synths.',
    status: 'Open'
  },
  {
    id: 'label_16',
    name: 'Beltran (Artist Promo)',
    email: 'promosbeltran@gmail.com',
    website: 'https://instagram.com/beltranmusic_',
    instagram: '@beltranmusic_',
    genre: 'Minimal / Deep Tech',
    region: 'São Paulo, Brazil 🇧🇷',
    notes: 'Brazilian minimal star. Specializes in heavy analog grooves, quirky low-pitched vocal snippets, and raw peak tech swing.',
    bestFitDescription: 'Rolling retro sub bass, playful/quirky voice clips, punchy analog-style percussion loops.',
    status: 'Open'
  },
  {
    id: 'label_18',
    name: 'Mochakk (Artist Promo)',
    email: 'mochakk.promos@dogghouse.com.br',
    website: 'https://instagram.com/mochakk',
    instagram: '@mochakk',
    genre: 'Minimal / Deep Tech',
    region: 'Rio de Janeiro, Brazil 🇧🇷',
    notes: 'Global dance music sensation. Looks for high-energy tech house with serious swing, funky basslines, and rich acoustic/vintage vocal music clips.',
    bestFitDescription: 'Heavy swings, funky analog sub-bass driving sequences, pitched-down live music samples.',
    status: 'Open'
  },
  {
    id: 'label_19',
    name: 'Michael Bibi (Artist Promo)',
    email: 'promos@solidgrooves.co.uk',
    website: 'https://instagram.com/michael_bibi_',
    instagram: '@michael_bibi_',
    genre: 'Minimal / Deep Tech',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Solid Grooves co-founder and tech house icon. Looking for deep, hypnotic, raw rolling tech house tools with serious groove.',
    bestFitDescription: 'Dark minimalist structures, groovy continuous percussive grids, high-vibe low-end sequences.',
    status: 'Open'
  },
  {
    id: 'label_20',
    name: 'Pawsa (Artist Promo)',
    email: 'pawsa.promos@solidgrooves.co.uk',
    website: 'https://instagram.com/pawsaofficial',
    instagram: '@pawsaofficial',
    genre: 'Minimal / Deep Tech',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Solid Grooves co-head. Notorious for sampling classic hip-hop and soul elements over extremely fat, clean minimal-tech loops.',
    bestFitDescription: 'Heavy MPC swing, vintage vocal-soul chops, bright rolling hand claps, deep sub-heavy baselines.',
    status: 'Open'
  },
  {
    id: 'label_21',
    name: 'ANOTR (Artist Promo)',
    email: 'promos@noartmusic.com',
    website: 'https://instagram.com/anotr.music',
    instagram: '@anotr.music',
    genre: 'Minimal / Deep Tech',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'No Art founders. Sourcing highly musical, soulful, and jazz-influenced deep minimal house tracks with high musician-grade quality.',
    bestFitDescription: 'Warm live Rhodes chords, vocal house elements, complex elegant acoustic percussion layered over deep grooves.',
    status: 'Open'
  },
  {
    id: 'label_22',
    name: 'Cloonee (Artist Promo)',
    email: 'promos@hellbentrecords.com',
    website: 'https://instagram.com/cloonee',
    instagram: '@cloonee',
    genre: 'Tech House',
    region: 'Los Angeles, United States 🇺🇸',
    notes: 'Hellbent Records head. Seeking massive peak-time club weapons built around dominant synth leads and catchy female electronic vocal cuts.',
    bestFitDescription: 'Loud, dominant sub basslines, clean catchy female hip-hop vocal chops, peak club elements.',
    status: 'Open'
  },
  {
    id: 'label_23',
    name: 'Black Coffee (Artist Promo)',
    email: 'promos@blackcoffee.dj',
    website: 'https://instagram.com/realblackcoffee',
    instagram: '@realblackcoffee',
    genre: 'Afro House',
    region: 'Johannesburg, South Africa 🇿🇦',
    notes: 'Global Afro House ambassador. Selects elegant, spiritual, piano-driven, and highly cinematic vocal Afro-deep music.',
    bestFitDescription: 'Sweeping deep strings, emotional acoustic piano chords, spiritual vocal chants, smooth shaker grooves.',
    status: 'Open'
  },
  {
    id: 'label_24',
    name: 'The Martinez Brothers (Artist Promo)',
    email: 'tmb.promos@cuttinheadz.com',
    website: 'https://instagram.com/themartinezbros',
    instagram: '@themartinezbros',
    genre: 'Tech House',
    region: 'New York, United States 🇺🇸',
    notes: 'Cuttin Headz creators. Looking for fast, raw, drum-heavy groovers inspired by New York hip-hop and underground culture.',
    bestFitDescription: 'Fast Conga/Bongo patterns, street spoken vocal hooks, raw energetic bass stabs.',
    status: 'Open'
  },
  {
    id: 'label_25',
    name: 'No Art Records',
    email: 'demos@noartmusic.com',
    website: 'https://noartmusic.com',
    instagram: '@noartmusic',
    genre: 'Minimal / Deep Tech',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Sophisticated Dutch imprint focusing on visual arts and soulful instrumentals fused with deep minimal swing layouts.',
    bestFitDescription: 'Vibrant acoustic brass instruments, warm classic rhodes layers, and elegant percussive loops.',
    status: 'Open'
  },
  {
    id: 'label_26',
    name: 'Green Velvet (Artist Promo)',
    email: 'promos@reliefrecords.com',
    website: 'https://instagram.com/greenvelvet',
    instagram: '@greenvelvet',
    genre: 'Tech House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Relief Records and Cajual legend. Looks for quirky, upbeat, fast, and vocally eccentric electronic club tracks.',
    bestFitDescription: 'Eccentric vocal loops, fast 909 hats and claps, energetic futuristic synth lines.',
    status: 'Open'
  },
  {
    id: 'label_27',
    name: 'Fisher (Artist Promo)',
    email: 'promos@catchandrelease.tv',
    website: 'https://instagram.com/followthefishtv',
    instagram: '@followthefishtv',
    genre: 'Tech House',
    region: 'Gold Coast, Australia 🇦🇺',
    notes: 'Catch and Release label boss. Looking for massive, energetic peak-time club builds and giant basslines for festival stages.',
    bestFitDescription: 'Gigantic builds, direct high-resonance sub bass hits, and memorable catchy command hooks.',
    status: 'Open'
  },
  {
    id: 'label_28',
    name: 'Chris Lake (Artist Promo)',
    email: 'promos@blackbookrecords.com',
    website: 'https://instagram.com/chrislake',
    instagram: '@chrislake',
    genre: 'Tech House',
    region: 'Los Angeles, United States 🇺🇸',
    notes: 'Black Book Records chief. Extremely selective about pristine sound design, clean dynamic low-ends, and highly creative concepts.',
    bestFitDescription: 'Crisp high-range engineering details, clean wide sub basses, unique SFX, memorable vocal cuts.',
    status: 'Open'
  },
  {
    id: 'label_29',
    name: 'Repopulate Mars',
    email: 'submissions@repopulatemars.com',
    website: 'https://repopulatemars.com',
    instagram: '@repopulatemars',
    genre: 'Tech House',
    region: 'Los Angeles, United States 🇺🇸',
    notes: 'Lee Foss’ galactic imprint. Focuses on tech house with futuristic textures, rolling hip-hop elements, and funky grooves.',
    bestFitDescription: 'Futuristic space sound FX, bouncy elastic basslines, sci-fi synth filters.',
    status: 'Open'
  },
  {
    id: 'label_30',
    name: 'Afterlife Records',
    email: 'demos@afterlife.ofc.com',
    website: 'https://afterlife.ofc',
    instagram: '@afterlife_ofc',
    genre: 'Melodic House',
    region: 'Milan, Italy 🇮🇹',
    notes: 'Tale of Us’ premier global label. Dark, heavy, emotional melodic techno with signature dramatic crescendos and tragic-hero synths.',
    bestFitDescription: 'Tragic synth plucks, sweeping cinematic white noise, slow heavy driving bass.',
    status: 'Open'
  },
  {
    id: 'label_31',
    name: 'Toolroom Records',
    email: 'demos@toolroomrecords.com',
    website: 'https://toolroomrecords.com',
    instagram: '@toolroomrecords',
    genre: 'Tech House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Mark Knight’s premier global brand. Accessible, high-fidelity, and brilliantly arranged peak-time tech house beats.',
    bestFitDescription: 'Clean digital arrangements, high mid-range chord stabs, robust clean drum drops.',
    status: 'Open'
  },
  {
    id: 'label_32',
    name: 'Drumcode Records',
    email: 'ar@drumcode.se',
    website: 'https://drumcode.se',
    instagram: '@drumcoderecords',
    genre: 'Electronic / Other',
    region: 'Stockholm, Sweden 🇸🇪',
    notes: 'Adam Beyer’s titan techno label. Heavy, precise, pounding warehouse-pumping festival techno and synth drives.',
    bestFitDescription: '909 pounding kick drums, industrial metal soundscapes, driving monophonic synth sequences.',
    status: 'Open'
  },
  {
    id: 'label_34',
    name: 'Diynamic Music',
    email: 'demos@diynamic.com',
    website: 'https://diynamic.com',
    instagram: '@diynamicmusic',
    genre: 'Melodic House',
    region: 'Hamburg, Germany 🇩🇪',
    notes: 'Solomun’s highly versatile, indie-dance, melodic, and groove-focused label with heavy retro synth melodies.',
    bestFitDescription: 'Retro 80s basslines, vocals with dark disco flair, playful melodies.',
    status: 'Open'
  },
  {
    id: 'label_35',
    name: 'Club Bad',
    email: 'promos@clubbad.com',
    website: 'https://instagram.com/clubbad_',
    instagram: '@clubbad_',
    genre: 'Tech House',
    region: 'Manchester, United Kingdom 🇬🇧',
    notes: 'Melé’s tribal-influenced house imprint. Looks for heavily syncopated organic live percussions, energy piano rolls, and global rhythms.',
    bestFitDescription: 'Polyrhythmic tribal congas, energetic piano loops, high-energy whistles and horn stabs.',
    status: 'Open'
  },
  {
    id: 'label_36',
    name: 'CircoLoco Records',
    email: 'submissions@circolocorecords.com',
    website: 'https://circolocorecords.com',
    instagram: '@circolocorecords',
    genre: 'Tech House',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Imprint by Rockstar Games and CircoLoco Ibiza. Highlights futuristic underground tech house and dark grooving minimal tech sounds.',
    bestFitDescription: 'Crisp club hats, dark synthesizers, heavy rolling bass textures, and cybernetic atmospheres.',
    status: 'Open'
  },
  {
    id: 'label_37',
    name: 'fabric London (Club Showcase)',
    email: 'promos@fabriclondon.com',
    website: 'https://fabriclondon.com',
    instagram: '@fabriclondonofficial',
    genre: 'Minimal / Deep Tech',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'World-famous club looking for cutting-edge minimal, deep tech, and breakbeat promos to curate their main room dancefloor lineups.',
    bestFitDescription: 'Deep sub frequencies, intelligent rhythmic grids, hypnotic loop textures, and British warehouse swing.',
    status: 'Open'
  },
  {
    id: 'label_38',
    name: 'Paradise Records',
    email: 'promos@paradiseibiza.com',
    website: 'https://instagram.com/paradiseibiza',
    instagram: '@paradiseibiza',
    genre: 'Tech House',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Jamie Jones’ curation of energetic, colorful, and bouncy tech house tracks built specifically for DC-10 dancefloor main stages.',
    bestFitDescription: 'Elastic synthesizers, joyful chord stabs, bouncy organic handclaps, and bouncy bass loops.',
    status: 'Open'
  },
  {
    id: 'label_39',
    name: 'Club Space Miami (Club Promo)',
    email: 'curator@clubspace.com',
    website: 'https://clubspace.com',
    instagram: '@spacemiami',
    genre: 'Tech House',
    region: 'Miami, United States 🇺🇸',
    notes: 'Legendary dynamic terrace club. Promoters and residents review peak tech house and deep house weapons that keep the terrace dancing past sunrise.',
    bestFitDescription: 'Long progressive tension builds, sunrise house chords, hypnotic deep sub grooves, and energetic drums.',
    status: 'Open'
  },
  {
    id: 'label_40',
    name: 'John Summit (Artist Promo)',
    email: 'promos@expertsonly.com',
    website: 'https://expertsonly.com',
    instagram: '@johnsummit',
    genre: 'Tech House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Experts Only label boss John Summit. High demand for energetic, vocal-heavy, emotional, and peak-time festival tech house weapons.',
    bestFitDescription: 'Stunning uplifting vocal hooks, raw analog-style synth stabs, high contrast drum drop builds, and heavy kicks.',
    status: 'Open'
  },
  {
    id: 'label_41',
    name: 'Peggy Gou (Artist Promo)',
    email: 'promos@gudurecords.com',
    website: 'https://instagram.com/peggygou_',
    instagram: '@peggygou_',
    genre: 'Disco House',
    region: 'Seoul, South Korea 🇰🇷',
    notes: 'Gudu Records head Peggy Gou. Seeking groovy disco-infused tracks, bright piano-driven analog house, and 90s acid elements.',
    bestFitDescription: 'Vibrant analog acid synth lines, classic tambourine loops, bright positive piano melodies, and retro drums.',
    status: 'Open'
  },
  {
    id: 'label_42',
    name: 'Hï Ibiza (Club Promo)',
    email: 'ar@hiibiza.com',
    website: 'https://hiibiza.com',
    instagram: '@hiibizaofficial',
    genre: 'Electronic / Other',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Ranked the worlds #1 nightclub. Resident programmers review futuristic, club-heavy underground anthems across tech house, deep tech, and melodic techno.',
    bestFitDescription: 'Immersive soundscapes, explosive sub bass drops, multi-layered dramatic peak-time electronic sound effects.',
    status: 'Open'
  },
  {
    id: 'label_43',
    name: 'Panorama Bar (Club Showcase)',
    email: 'booking@berghain.de',
    website: 'https://berghain.de',
    instagram: '@berghain_ostgut',
    genre: 'Deep House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'The peak temple of underground clubbing. Seeking smart, abstract, deep house and classic vinyl-centric organic house with deep emotional warmth.',
    bestFitDescription: 'Hypnotic repetitive grooves, raw vintage analogue drum machines, subtle filter Sweeps, and soulful deep chords.',
    status: 'Open'
  },
  {
    id: 'label_44',
    name: 'DC-10 Resident DJs (Artist Promo)',
    email: 'promos@dc15ibiza.com',
    website: 'https://instagram.com/dc10ibizaofficial',
    instagram: '@dc10ibizaofficial',
    genre: 'Minimal / Deep Tech',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Underground resident DJs at Curcio. Sourcing dark, raw minimal tracks with massive groove and organic percussion loops for the garden stage.',
    bestFitDescription: 'Hypnotic low-frequency baselines, snappy open hi-hat patterns, trippy micro-organic sound design.',
    status: 'Open'
  },
  {
    id: 'label_45',
    name: 'Vintage Culture (Artist Promo)',
    email: 'curator@vintageculture.com',
    website: 'https://vintageculture.com',
    instagram: '@vintageculture',
    genre: 'Tech House',
    region: 'São Paulo, Brazil 🇧🇷',
    notes: 'Brazilian superstar DJ. Seeking high impact tech house, bass-driven progressive grooves, and emotional vocal hooks for main stage sets.',
    bestFitDescription: 'Fat compressed basslines, epic rising transitions, huge vocal sweeps, and punchy kick drums.',
    status: 'Open'
  },
  {
    id: 'label_46',
    name: 'Green Valley (Club Showcase)',
    email: 'demos@greenvalleybr.com',
    website: 'https://greenvalleybr.com',
    instagram: '@greenvalleybr',
    genre: 'Melodic House',
    region: 'Camboriú, Brazil 🇧🇷',
    notes: 'Giant Brazilian open-air jungle club. Prefers lush, melodic, high energy progressive house and emotional, sweeping organic grooves.',
    bestFitDescription: 'Tropical atmospheric pad layers, bright acoustic guitar drops, and sweeping beautiful modular arpeggios.',
    status: 'Open'
  },
  {
    id: 'label_47',
    name: 'Dom Dolla (Artist Promo)',
    email: 'promos@domdolla.com',
    website: 'https://domdolla.com',
    instagram: '@domdolla',
    genre: 'Tech House',
    region: 'Melbourne, Australia 🇦🇺',
    notes: 'Award-winning Aussie tech house king. Seeking peak-time club weapons, dirty basslines, quirky/memorable spoken vocals, and massive synth drops.',
    bestFitDescription: 'Heavily sidechained synth stabs, dark catchy vocal hooks, and colossal mid-range electronic bass stabs.',
    status: 'Open'
  },
  {
    id: 'label_48',
    name: 'Solomun (Artist Promo)',
    email: 'promos@diynamic.com',
    website: 'https://instagram.com/solomun',
    instagram: '@solomun',
    genre: 'Melodic House',
    region: 'Hamburg, Germany 🇩🇪',
    notes: 'Diynamic legend. Sourcing tracks with distinct, unforgettable vocal hooks, heavy vintage 80s indie dance grooves, and sweeping structures.',
    bestFitDescription: 'Fat analog synth basses, nostalgic emotional vocal samples, cinematic disco drums, and dynamic dramatic structures.',
    status: 'Open'
  },
  {
    id: 'label_49',
    name: 'Honey Dijon (Artist Promo)',
    email: 'submissions@honeydijon.org',
    website: 'https://instagram.com/honeydijon',
    instagram: '@honeydijon',
    genre: 'House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Chicago house pioneer. Looks for raw, energetic classic-style house tracks, vocal anthems, jackin drums, and queer club energy inputs.',
    bestFitDescription: 'Jackin 909 drum loops, powerful heavy diva vocal house hooks, soulful brass samples, and groovy organ basslines.',
    status: 'Open'
  },
  {
    id: 'label_50',
    name: 'Rush Hour Records',
    email: 'demos@rushhour.nl',
    website: 'https://rushhour.nl',
    instagram: '@rushhourmusic',
    genre: 'Electronic / Other',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Iconic store/label compiling eclectic underground house, motorized Detroit techno, leftfield electro, and deeply experimental electronics.',
    bestFitDescription: 'Dissonant synth cords, vintage DX7 vibes, raw machine rhythm grids, and classic futuristic space chords.',
    status: 'Open'
  },
  {
    id: 'label_51',
    name: 'Dixon (Artist Promo)',
    email: 'promos@innervisions.com',
    website: 'https://instagram.com/dixon_',
    instagram: '@dixon_',
    genre: 'Melodic House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Innervisions label head. Sourcing hyper-intelligent, progressive melodic house containing deep acoustic percussion and elegant soundscapes.',
    bestFitDescription: 'Detailed modular filter loops, intricate percussion grids, dramatic organic string arrays, and custom reverb structures.',
    status: 'Open'
  },
  {
    id: 'label_52',
    name: 'Charlotte de Witte (Artist Promo)',
    email: 'promos@kntxt.be',
    website: 'https://kntxt.be',
    instagram: '@charlottedewittemusic',
    genre: 'Electronic / Other',
    region: 'Ghent, Belgium 🇧🇪',
    notes: 'KNTXT label boss de Witte. Sourcing dark, heavy, hypnotic techno, rapid 135+ acid lines, and industrial synth structures that dominate.',
    bestFitDescription: 'Acid arpeggios, heavily distorted industrial kick drum structures, short robotic spoken vocals.',
    status: 'Open'
  },
  {
    id: 'label_53',
    name: 'Amelie Lens (Artist Promo)',
    email: 'promos@lenske.com',
    website: 'https://instagram.com/amelie_lens',
    instagram: '@amelie_lens',
    genre: 'Electronic / Other',
    region: 'Antwerp, Belgium 🇧🇪',
    notes: 'Exhale / Lenske boss. Giant demand for lightning-fast club stimulants, 909 acid lines, heavy peak warehouse claps, and energetic female vocals.',
    bestFitDescription: 'Fast pounding metallic kicks, screaming raw 303 acid synths, raw warehouse reverb vocals, and rapid shakers.',
    status: 'Open'
  },
  {
    id: 'label_54',
    name: 'Shelter Amsterdam (Club Showcase)',
    email: 'promos@shelteramsterdam.nl',
    website: 'https://shelteramsterdam.nl',
    instagram: '@shelteramsterdam',
    genre: 'Minimal / Deep Tech',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Underground concrete basement club. Curates raw, hypnotic, minimal deep tech and micro-house tracks built for massive club sub-bass sound systems.',
    bestFitDescription: 'Hollow dynamic synth sub bass, microsonic click-clack rhythms, warm tape delay chords, and smooth transitions.',
    status: 'Open'
  },
  {
    id: 'label_55',
    name: 'Desert Hearts Records',
    email: 'submissions@deserthearts.us',
    website: 'https://deserthearts.us',
    instagram: '@deserthearts',
    genre: 'Tech House',
    region: 'San Diego, United States 🇺🇸',
    notes: 'House, Techno, Love festival collective. Seeking vibrant, quirky, groovy, and positive desert vibes tech house filled with analog flavor.',
    bestFitDescription: 'Whimsical high-range vocal drops, bouncy energetic basslines, funky cowbells, and warm analog organ stabs.',
    status: 'Open'
  },
  {
    id: 'label_56',
    name: 'Permanent Vacation (Label)',
    email: 'demos@perm-vac.com',
    website: 'https://permanentvacation.com',
    instagram: '@permanentvacation',
    genre: 'Disco House',
    region: 'Munich, Germany 🇩🇪',
    notes: 'Premier electronic indie label. Combining tropical disco notes, cosmic house space effects, and beautiful nostalgic synth wave.',
    bestFitDescription: 'Nostalgic synth wave leads, retro 707 drum samples, beautiful cosmic synth sweeps, and warm house bass.',
    status: 'Open'
  },
  {
    id: 'label_57',
    name: 'Rex Club (Club Showcase)',
    email: 'demos@rexclub.com',
    website: 'https://rexclub.com',
    instagram: '@rexclub',
    genre: 'Deep House',
    region: 'Paris, France 🇫🇷',
    notes: 'Parisian electronic temple. Curating pure analog-driven deep house, electronic grooves, and high-fidelity melodic underground house tools.',
    bestFitDescription: 'Deep analog bass warm textures, crisp acoustic shaker loops, warm vintage Rhodes, and elegant sound design.',
    status: 'Open'
  },
  {
    id: 'label_58',
    name: 'Robert Johnson (Club Showcase)',
    email: 'demos@robert-johnson.de',
    website: 'https://robert-johnson.de',
    instagram: '@robertjohnsonclub',
    genre: 'House',
    region: 'Frankfurt, Germany 🇩🇪',
    notes: 'Super-intimate vinyl-centric club. Looking for incredibly clean, minimal house loops, detailed organic textures, and deep-warm house roots.',
    bestFitDescription: 'Very minimalistic drum patterns, elegant high-fidelity tape-delay loops, deep warm bass chords.',
    status: 'Open'
  },
  {
    id: 'label_59',
    name: 'Sub Club (Club Showcase)',
    email: 'bookings@subclub.co.uk',
    website: 'https://subclub.co.uk',
    instagram: '@subclubglasgow',
    genre: 'House',
    region: 'Glasgow, Scotland 🇬🇧',
    notes: 'Famous Scottish basement. Sourcing high velocity house music, raw bass-grooved club tools, and classic organic vocal hooks.',
    bestFitDescription: 'Highly energetic sidechained vocal chops, heavy driving raw sub basslines, and punchy retro house claps.',
    status: 'Open'
  },
  {
    id: 'label_60',
    name: 'Carl Cox (Artist Promo)',
    email: 'promos@awesome-soundwave.com',
    website: 'https://carlcox.com',
    instagram: '@carlcoxofficial',
    genre: 'Electronic / Other',
    region: 'Manchester, United Kingdom 🇬🇧',
    notes: 'Awesome Soundwave boss Cox. Seeks energetic house, groovy driving techno elements, and massive classic vocal drops built for big stages.',
    bestFitDescription: 'Energetic high-energy synth loops, memorable dynamic house chords, driving congas, and huge transition FX.',
    status: 'Open'
  },
  {
    id: 'label_61',
    name: 'Marco Carola (Artist Promo)',
    email: 'promos@musicon.com',
    website: 'https://instagram.com/marcocarola',
    instagram: '@marcocarola',
    genre: 'Minimal / Deep Tech',
    region: 'Naples, Italy 🇮🇹',
    notes: 'Music On head Marco Carola. Sourcing hyper-repetitive, rolling, hypnotic minimal tech grooves and snappy percussion loops for long club sets.',
    bestFitDescription: 'Snappy snare rolls, rolling organic sub bass layers, repetitive rhythmic vocal cuts, and tight drum dynamics.',
    status: 'Open'
  },
  {
    id: 'label_62',
    name: 'Rekids Records',
    email: 'demos@rekids.com',
    website: 'https://rekids.com',
    instagram: '@rekidsofficial',
    genre: 'House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Radio Slave’s world-class techno and house label. High priority on raw, long, hypnotic underground loop tools with extreme power.',
    bestFitDescription: 'Raw distorted 909 groove beds, continuous vocal loop layers, dark synthesizer sweeps, and industrial room vibes.',
    status: 'Open'
  },
  {
    id: 'label_63',
    name: 'Clone Records',
    email: 'distribution@clone.nl',
    website: 'https://clone.nl',
    instagram: '@clonerecords',
    genre: 'Electronic / Other',
    region: 'Rotterdam, Netherlands 🇳🇱',
    notes: 'Legendary dynamic hardware music record label. Sourcing raw analog acid, electro breakbeats, classic Chicago house, and modular electronic tracks.',
    bestFitDescription: 'Raw SH-101 lead lines, TR-808 drum machine patterns, vintage hardware distortions, and futuristic sci-fi sound effects.',
    status: 'Open'
  },
  {
    id: 'label_64',
    name: 'Giegling',
    email: 'demos@giegling.net',
    website: 'https://giegling.net',
    instagram: '@giegling',
    genre: 'Deep House',
    region: 'Weimar, Germany 🇩🇪',
    notes: 'Highly artistic, mysterious and prestigious deep house collective. Cult-favorite atmospheric, nostalgic, dusty, and melancholy house textures.',
    bestFitDescription: 'Dusty vinyl-crackle loops, melancholic piano pieces, warm analog background hiss, and highly artistic, subtle electronic elements.',
    status: 'Open'
  },
  {
    id: 'label_65',
    name: 'Hessle Audio',
    email: 'promos@hessleaudio.com',
    website: 'https://hessleaudio.com',
    instagram: '@hessleaudio',
    genre: 'Electronic / Other',
    region: 'Leeds, United Kingdom 🇬🇧',
    notes: 'Ben UFO, Pangaea, and Pearson Sound’s cutting-edge UK bass label. Seeking syncopated rhythms, UK garage swing, sub bass systems, and polyrhythms.',
    bestFitDescription: 'Polyrhythmic breaks, booming dubstep-inspired sub bass, custom percussive design, and highly unique kinetic energy.',
    status: 'Open'
  },
  {
    id: 'label_66',
    name: 'Phonox London (Club Showcase)',
    email: 'promos@phonox.co.uk',
    website: 'https://phonox.co.uk',
    instagram: '@phonoxlondon',
    genre: 'Disco House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Vibrant London club seeking organic disco house loops, vocal edit cutups, soulful vocals, and warm organic drum systems.',
    bestFitDescription: 'Uplifting funky disco bass guitar loops, fast energetic jazz horns, and positive vocal hooks.',
    status: 'Open'
  },
  {
    id: 'label_67',
    name: 'Warp Records (Artist Promo)',
    email: 'ar@warprecords.co.uk',
    website: 'https://warp.net',
    instagram: '@warprecords',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Pioneering IDM and experimental beat giant. Seeking highly complex synth layouts, glitch beats, avant-garde textures, and futuristic sound systems.',
    bestFitDescription: 'Intense glitch patterns, complex modular math-based sequences, beautiful digital sound degradation.',
    status: 'Open'
  },
  {
    id: 'label_68',
    name: 'Homa Records',
    email: 'demos@homarecords.pt',
    website: 'https://instagram.com/homarecords',
    instagram: '@homarecords',
    genre: 'Afro House',
    region: 'Lisbon, Portugal 🇵🇹',
    notes: 'Portuguese organic label blending deep tech-house swing with live recorded African percussions and organic vocal harmonies.',
    bestFitDescription: 'Polyrhythmic hand drumming, spacious acoustic pads, deep spiritual Lisbon vocal chants, warm basslines.',
    status: 'Open'
  },
  {
    id: 'label_69',
    name: 'Womb Club (Club Showcase)',
    email: 'promos@womb.co.jp',
    website: 'https://womb.co.jp',
    instagram: '@womb_tokyo',
    genre: 'Melodic House',
    region: 'Tokyo, Japan 🇯🇵',
    notes: 'Tokyo electronic temple. Seeking atmospheric melodic house, high energy progressive synths, and clean futuristic electronic club tracks.',
    bestFitDescription: 'Lush atmospheric pads, futuristic lead synths, crisp crystal digital drums, and smooth progressive transitions.',
    status: 'Open'
  },
  {
    id: 'label_70',
    name: 'Hondo Club (Club Showcase)',
    email: 'demos@hondo.club',
    website: 'https://instagram.com/hondo_tbilisi',
    instagram: '@hondo_tbilisi',
    genre: 'Electronic / Other',
    region: 'Tbilisi, Georgia 🇬🇪',
    notes: 'Deep underground industrial club. Sourcing heavy driving techno, futuristic concrete synth bass rhythms, and industrial drum tracks.',
    bestFitDescription: 'Massive sidechained heavy kick drums, industrial concrete atmosphere reverbs, energetic synth loops.',
    status: 'Open'
  },
  {
    id: 'label_71',
    name: 'Tresor Berlin (Club Showcase)',
    email: 'demos@tresorberlin.de',
    website: 'https://tresorberlin.com',
    instagram: '@tresorberlin',
    genre: 'Electronic / Other',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Legendary historical techno fortress. Looking for dark, mechanical, industrial acid line loops, 909 kicks, and classic Berlin techno drives.',
    bestFitDescription: 'Loud pounding industrial kicks, raw distorted modular acid synths, cold metallic echo hi-hats.',
    status: 'Open'
  },
  {
    id: 'label_73',
    name: 'Blitz Club (Club Showcase)',
    email: 'demos@blitz.club',
    website: 'https://blitz.club',
    instagram: '@blitzclub',
    genre: 'Melodic House',
    region: 'Munich, Germany 🇩🇪',
    notes: 'Acclaimed audiophile club. Sourcing pristine sound setups, clean stereo-image progressive melodies, and hyper-dynamic deep house beats.',
    bestFitDescription: 'Pristine wide stereo pads, snappy digital drums, complex clean melodic arrangements, deep detailed low-ends.',
    status: 'Open'
  },
  {
    id: 'label_74',
    name: 'Sound Nightclub (Club Promo)',
    email: 'promos@soundnightclub.com',
    website: 'https://soundnightclub.com',
    instagram: '@soundnightclub',
    genre: 'Tech House',
    region: 'Los Angeles, United States 🇺🇸',
    notes: 'Premium LA underground music space. Elite residents review dirty tech house tools, massive bass lines, and groovy club vocal tracks.',
    bestFitDescription: 'Thick heavily-compressed basslines, catchy spoken word vocals, snappy analog house claps.',
    status: 'Open'
  },
  {
    id: 'label_75',
    name: 'Haelos Records (Label)',
    email: 'submissions@haelosmusic.com',
    website: 'https://haelos.com',
    instagram: '@haelos',
    genre: 'Deep House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Atmospheric electronic indie label. Looks for trip-hop elements, delayed chord progressions, deep organic house elements, and dark vocal stabs.',
    bestFitDescription: 'Dusty breakbeat percussion, deep swelling acoustic vocal layers, dark synth sweeps.',
    status: 'Open'
  },
  {
    id: 'label_76',
    name: 'Phonique (Artist Promo)',
    email: 'promos@phonique.de',
    website: 'https://phonique.de',
    instagram: '@phoniquemusic',
    genre: 'Deep House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Pioneer of the Berlin deep house sound. High interest in high-fidelity vocal deep house, organic tech-grooves, and soulful analog layouts.',
    bestFitDescription: 'Warm Rhodes chords, groovy acoustic hand percussion, deep emotional soulful male/female vocals.',
    status: 'Open'
  },
  {
    id: 'label_77',
    name: 'Gerd Janson (Artist Promo)',
    email: 'promos@runningbackrecords.com',
    website: 'https://instagram.com/gerdjansongerd',
    instagram: '@gerdjansongerd',
    genre: 'Disco House',
    region: 'Frankfurt, Germany 🇩🇪',
    notes: 'Running Back label boss Gerd Janson. Looking for joyful house, cosmic indie disco, 80s arpeggiating synth beds, and classic vocal edit tools.',
    bestFitDescription: 'Nostalgic 80s analog synthesizer presets, bouncy disco guitar chops, upbeat energetic live claps.',
    status: 'Open'
  },
  {
    id: 'label_78',
    name: 'Running Back Records',
    email: 'demos@runningback.de',
    website: 'https://instagram.com/runningbackrecords',
    instagram: '@runningbackrecords',
    genre: 'House',
    region: 'Frankfurt, Germany 🇩🇪',
    notes: 'Premier German house imprint curated by Gerd Janson. Celebrates raw classic house, energetic synth chords, and euphoric underground club vibes.',
    bestFitDescription: 'Bright classic string loops, powerful 909 jackin rims, melodic arpeggiated filters, classic heavy house vibes.',
    status: 'Open'
  },
  {
    id: 'label_79',
    name: 'Kater Blau (Club Showcase)',
    email: 'promos@katerblau.de',
    website: 'https://katerblau.de',
    instagram: '@katerblau',
    genre: 'Melodic House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Iconic riverside club. Sourcing funky, mystical, slow-paced organic house, playful progressive keys, and whimsical sound design layers.',
    bestFitDescription: 'Quirky retro-synthesizer effects, organic warm synth progressions, playful acoustic bells, slow deep rolling bass.',
    status: 'Open'
  },
  {
    id: 'label_80',
    name: 'Sisyphos (Club Showcase)',
    email: 'promos@sisyphos-berlin.de',
    website: 'https://sisyphos-berlin.de',
    instagram: '@sisyphos_berlin',
    genre: 'Electronic / Other',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Famous wonderland festival club in Berlin. Seeking happy, hypnotic, high-energy psy-house, tribal tech house, and melodic techno weapons.',
    bestFitDescription: 'Polyrhythmic bouncy drums, mind-bending psychedelic sound effects, long powerful builds, high-vibe vocals.',
    status: 'Open'
  },
  {
    id: 'label_81',
    name: 'Audio Geneva (Club Showcase)',
    email: 'promos@audio.swiss',
    website: 'https://audio.club',
    instagram: '@audioclubgeneva',
    genre: 'Tech House',
    region: 'Geneva, Switzerland 🇨🇭',
    notes: 'High-end Swiss electronic club looking for massive rolling tech-house and minimal-deep beats to supply their weekend resident sets.',
    bestFitDescription: 'Rolling MPC drums, clean catchy vocal chops, responsive sub-bass energy.',
    status: 'Open'
  },
  {
    id: 'label_82',
    name: 'Warung Beach Club (Club Showcase)',
    email: 'demos@warungclub.com',
    website: 'https://warungclub.com',
    instagram: '@warungclub',
    genre: 'Melodic House',
    region: 'Itajaí, Brazil 🇧🇷',
    notes: 'The temple of electronic music in Brazil. Open-air beach vibe. Prefers deep organic house, melodic techno, and sweeping emotional synths.',
    bestFitDescription: 'Deep oceanic sweep pads, organic wind instruments, slow emotional builds, and deep warm electronic grooves.',
    status: 'Open'
  },
  {
    id: 'label_84',
    name: 'Fabric Room One Resident (Artist Showcase)',
    email: 'promos@fabriclondon.com',
    website: 'https://fabriclondon.com',
    instagram: '@fabriclondonofficial',
    genre: 'Minimal / Deep Tech',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Fabric London Room One residents looking for deep minimalist rolling dance heaters with outstanding sub-bass details.',
    bestFitDescription: 'Snappy rhythmic grids, dark mysterious filter sweeps, deep heavy sub basslines.',
    status: 'Open'
  },
  {
    id: 'label_85',
    name: 'Sub Club Resident DJs (Club Showcase)',
    email: 'promos@subclub.co.uk',
    website: 'https://subclub.co.uk',
    instagram: '@subclubglasgow',
    genre: 'House',
    region: 'Glasgow, Scotland 🇬🇧',
    notes: 'Resident DJs curation from historical Sub Club Glasgow. Looking for modern bass house adapters, soulful vocal tracks, and raw energetic club heaters.',
    bestFitDescription: 'Highly sidechained house basslines, bright rolling open hats, classic 909 rides, snappy vocal edits.',
    status: 'Open'
  },
  {
    id: 'label_86',
    name: 'Solid Grooves Raw',
    email: 'submissions@solidgroovesraw.co.uk',
    website: 'https://solidgrooves.co.uk',
    instagram: '@solidgroovesraw',
    genre: 'Tech House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Underground imprint of Michael Bibi’s Solid Grooves. Sourcing heavy basslines, raw jackin’ beats, and energetic underground tech house.',
    bestFitDescription: 'Thick subwoofer-friendly bassline, repetitive catchy spoken-word elements, and very sharp hi-hats.',
    status: 'Open'
  },
  {
    id: 'label_87',
    name: 'Innervisions',
    email: 'demos@innervisions.com',
    website: 'https://innervisions.com',
    instagram: '@innervisions_',
    genre: 'Melodic House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'The legendary label founded by Dixon and Åme. Looking for futuristic soundscapes, dramatic melodic developments, and deeply emotional modular pieces.',
    bestFitDescription: 'Complex polyrhythmic drums, sweeping cinematic strings, deep modular arps, and highly refined transition curves.',
    status: 'Open'
  },
  {
    id: 'label_88',
    name: 'Fisher (Artist Promo)',
    email: 'promos@catchandrelease.la',
    website: 'https://fishermusic.com',
    instagram: '@followthefishtv',
    genre: 'Tech House',
    region: 'Gold Coast, Australia 🇦🇺',
    notes: 'Aussie showman Fisher’s promo box. Demands high-visibility, giant festival tech house builders with massive low-end drops.',
    bestFitDescription: 'Massive vocal stabs, rolling standard 126bpm tech-house drum grids, and hyper-compressed heavy sub drops.',
    status: 'Open'
  },
  {
    id: 'label_89',
    name: 'Claptone (Artist Promo)',
    email: 'promos@claptone.com',
    website: 'https://claptone.com',
    instagram: '@claptone.official',
    genre: 'House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Masked house icon Claptone. Looking for charming piano chords, clean house vocal hooks, and energetic indie-dance influence.',
    bestFitDescription: 'Catchy melodic piano loops, soulful accessible vocals, energetic dynamic baseline, and warm acoustic percussion.',
    status: 'Open'
  },
  {
    id: 'label_90',
    name: 'Defected Records',
    email: 'demos@defected.com',
    website: 'https://defected.com',
    instagram: '@defectedrecords',
    genre: 'House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'The golden standard of worldwide house music. Sourcing peak soulful house, vocal anthems, real instrumentation, and massive classic grooves.',
    bestFitDescription: 'Uplifting diva vocals, authentic piano chords, acoustic shakers, and groovy 4x4 classic house layouts.',
    status: 'Open'
  },
  {
    id: 'label_91',
    name: 'Glitterbox',
    email: 'promos@glitterboxibiza.com',
    website: 'https://glitterboxibiza.com',
    instagram: '@glitterboxibiza',
    genre: 'Disco House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Vibrant disco-infused Sister label to Defected. Sourcing retro disco edits, massive funky horn sections, active baseline guitars, and gorgeous vocals.',
    bestFitDescription: 'Slap basslines, organic percussion sections, vintage sax or horn loops, and energetic dancefloor vibes.',
    status: 'Open'
  },
  {
    id: 'label_92',
    name: 'Dynamic Grooves',
    email: 'demos@dynamicgrooves.it',
    website: 'https://instagram.com/dynamicgrooves_it',
    instagram: '@dynamicgrooves_it',
    genre: 'Minimal / Deep Tech',
    region: 'Milan, Italy 🇮🇹',
    notes: 'Subterranean Italian imprint. Sourcing precise, swinging micro-house loops, minimal tech patterns, and detailed mechanical textures.',
    bestFitDescription: 'Minimalist drum machine syncops, subtle synth pad washes, microtonal static effects, and raw rolling sub loops.',
    status: 'Open'
  },
  {
    id: 'label_93',
    name: 'Damian Lazarus (Artist Promo)',
    email: 'promos@crosstownrebels.com',
    website: 'https://crosstownrebels.com',
    instagram: '@damian_lazarus',
    genre: 'Deep House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Crosstown Rebels head Damian Lazarus. Looking for wizard-like trippy leftfield house, mystical vocal snippets, and unconventional space grooves.',
    bestFitDescription: 'Hypnotic slow-evolving pads, world music vocal components, modular bleeps, and warm organic drum lines.',
    status: 'Open'
  },
  {
    id: 'label_94',
    name: 'Crosstown Rebels',
    email: 'demos@crosstownrebels.com',
    website: 'https://crosstownrebels.com',
    instagram: '@crosstownrebels',
    genre: 'Deep House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Underground tastemaker label releasing alternative, deep, psychedelic, and highly curated avant-garde organic and tech house.',
    bestFitDescription: 'Atmospheric textures, quirky mid-frequency leads, rich non-standard percussion arrangements, dark deep grooves.',
    status: 'Open'
  },
  {
    id: 'label_95',
    name: 'Martinez Brothers (Artist Promo)',
    email: 'promos@cuttinheadz.com',
    website: 'https://instagram.com/themartinezbros',
    instagram: '@themartinezbros',
    genre: 'Tech House',
    region: 'New York, United States 🇺🇸',
    notes: 'Cuttin’ Headz label bosses. Looking for heavy, raw NYC hip-hop samples, warehouse-ready tech-house beats, and energetic rolling basslines.',
    bestFitDescription: 'Vibrant old-school hip-hop vocal snippets, raw MPC drum swing, and dark aggressive synthesizer transitions.',
    status: 'Open'
  },
  {
    id: 'label_96',
    name: 'Keinemusik (Artist Promo)',
    email: 'promos@keinemusik.com',
    website: 'https://keinemusik.com',
    instagram: '@keinemusikcrue',
    genre: 'Afro House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Direct pipeline to &ME, Rampa, and Adam Port. Sourcing beautiful organic house, Afro-centric vocal layers, acoustic guitar lines, and slow builds.',
    bestFitDescription: 'Organic hand clapping, emotional melodic whistles, melodic vocal chants, and deeply layered acoustic atmosphere.',
    status: 'Open'
  },
  {
    id: 'label_97',
    name: 'Kompakt Records',
    email: 'demos@kompakt.fm',
    website: 'https://kompakt.fm',
    instagram: '@kompaktrecords',
    genre: 'Melodic House',
    region: 'Cologne, Germany 🇩🇪',
    notes: 'Legendary Cologne institution spanning decades. Looking for beautiful, nostalgic micro-ambient loops, clicky beats, and lush panoramic synths.',
    bestFitDescription: 'Gentle click beats, hazy tape-saturated lead melodies, beautiful warm synthetic structures, and long journeys.',
    status: 'Open'
  },
  {
    id: 'label_98',
    name: 'Afterlife Records',
    email: 'demos@afterlife.ofc',
    website: 'https://afterlife.ofc',
    instagram: '@afterlife_ofc',
    genre: 'Melodic House',
    region: 'Milan, Italy 🇮🇹',
    notes: 'The global titan of melodic techno and progressive house. Seeking grand cinematic synth chords, deep dark rolling sweeps, and emotional drops.',
    bestFitDescription: 'Dramatically intense rising arpeggios, massive heavy sidechained lead synths, clean robotic vocal cuts.',
    status: 'Open'
  },
  {
    id: 'label_99',
    name: 'Tale Of Us (Artist Promo)',
    email: 'promos@afterlife.ofc',
    website: 'https://afterlife.ofc',
    instagram: '@taleofus',
    genre: 'Melodic House',
    region: 'Milan, Italy 🇮🇹',
    notes: 'World-famous Afterlife founders. Sourcing deep, haunting cinematic modular sweeps, cosmic progressive techno, and raw emotional power.',
    bestFitDescription: 'Long dark progressive builds, minor-chord lead arpeggios, detailed white-noise transitions, heavy kicks.',
    status: 'Open'
  },
  {
    id: 'label_100',
    name: 'Pacha Ibiza (Club Showcase)',
    email: 'promos@pacha.com',
    website: 'https://pacha.com',
    instagram: '@pachaibizaofficial',
    genre: 'House',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'The original double-cherry clubbing destination. Resident DJs review premium, uplifting classic, and vocal-heavy tech house music.',
    bestFitDescription: 'Summer-themed house chords, friendly vocal snippets, warm rolling bass grooves, and energetic handclaps.',
    status: 'Open'
  },
  {
    id: 'label_101',
    name: 'Amnesia Ibiza (Club Showcase)',
    email: 'ar@amnesia.es',
    website: 'https://amnesia.es',
    instagram: '@amnesiaibiza',
    genre: 'Tech House',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Iconic terrace club. Reviewing prime-time terrace heaters: heavy sub bass tech-house, energetic rolling breaks, and high-energy builds.',
    bestFitDescription: 'Explosive high-impact drum rolls, raw mid-range electronic basslines, and bright clattering open hi-hat grids.',
    status: 'Open'
  },
  {
    id: 'label_102',
    name: 'DC-10 Ibiza (Club Showcase)',
    email: 'demos@dc10ibiza.com',
    website: 'https://instagram.com/dc10ibizaofficial',
    instagram: '@dc10ibizaofficial',
    genre: 'Minimal / Deep Tech',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'The legendary hangar club. Resident curation looking for deep, trippy, raw modular tech, and minimalistic UK garage blends.',
    bestFitDescription: 'Hypnotic raw dynamic sub-bass, snappy and sparse drum patterns, microtonal vocal structures, space bleeps.',
    status: 'Open'
  },
  {
    id: 'label_103',
    name: 'Awakenings (Club Showcase)',
    email: 'promos@awakenings.nl',
    website: 'https://awakenings.com',
    instagram: '@awakenings',
    genre: 'Electronic / Other',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'The worlds premier techno festival organizer. Reviewing heavy warehouse functional rhythms, peak acid patterns, and industrial synth layout blocks.',
    bestFitDescription: 'Heavy pounding kick drum structures, raw acid patterns, futuristic dark industrial design sequences.',
    status: 'Open'
  },
  {
    id: 'label_104',
    name: 'Loveland (Club Showcase)',
    email: 'demos@loveland.nl',
    website: 'https://loveland.nl',
    instagram: '@lovelandnl',
    genre: 'Melodic House',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Loveland Amsterdam festival team. Seeking beautiful, accessible progressive melodies, majestic vocal deep house, and uplifting club anthems.',
    bestFitDescription: 'Beautiful soaring background synth pads, clean uplifting progressive chords, crisp high fidelity percussion.',
    status: 'Open'
  },
  {
    id: 'label_105',
    name: 'DGTL (Club Showcase)',
    email: 'curator@dgtl.nl',
    website: 'https://dgtl.nl',
    instagram: '@dgtlmusic',
    genre: 'Electronic / Other',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Art-forward electronics festival group. Seeking leftfield melodic house, robotic electronic sequences, modular house, and avant-garde designs.',
    bestFitDescription: 'Intricate stereo synthesizer patterns, experimental mechanical beats, dynamic dramatic arrangements.',
    status: 'Open'
  },
  {
    id: 'label_106',
    name: 'Warung Recordings',
    email: 'demos@warungrecords.com.br',
    website: 'https://warungclub.com',
    instagram: '@warungrec',
    genre: 'Melodic House',
    region: 'Itajaí, Brazil 🇧🇷',
    notes: 'Releasing beautiful progressive underground tracks directly corresponding to the Brazilian beachfront temple. Demands deep feelings and lush strings.',
    bestFitDescription: 'Lush oceanic atmosphere layers, acoustic guitar notes, long dramatic arpeggios, and heavy warm grooves.',
    status: 'Open'
  },
  {
    id: 'label_107',
    name: 'Local Brazilian DJ Residents (Artist Promo)',
    email: 'promos@localbrazilianresidents.br',
    website: 'https://instagram.com/brazil-underground',
    instagram: '@brazilunderground',
    genre: 'Tech House',
    region: 'São Paulo, Brazil 🇧🇷',
    notes: 'Resident DJs across top Brazilian clubs. Looking for high impact tech house, bouncy basslines, and percussion loops with a Latin flavor.',
    bestFitDescription: 'Bouncy basslines, dynamic acoustic percussion loops, and memorable Portuguese spoken-word hooks.',
    status: 'Open'
  },
  {
    id: 'label_108',
    name: 'Nordstern (Club Showcase)',
    email: 'promos@nordstern.com',
    website: 'https://nordstern.com',
    instagram: '@nordsternbasel',
    genre: 'Minimal / Deep Tech',
    region: 'Basel, Switzerland 🇨🇭',
    notes: 'Audiophile boat club in Basel. Sourcing hyper-clean minimal tech house loops, deep space electronics, and microtonic drums.',
    bestFitDescription: 'Ultra-clear digital transients, smooth deep sub bass grids, tape delay chords, and sparse arrangements.',
    status: 'Open'
  },
  {
    id: 'label_109',
    name: 'Lisbon Grooves',
    email: 'demos@lisbongrooves.pt',
    website: 'https://instagram.com/lisbongrooves',
    instagram: '@lisbongrooves',
    genre: 'Minimal / Deep Tech',
    region: 'Lisbon, Portugal 🇵🇹',
    notes: 'Portuguese organic tech movement. Sourcing delicate minimal beats, subtle congas, deep sub bass structures, and sun-kissed textures.',
    bestFitDescription: 'Gentle hand percussion, microtonal bass loops, deep warm atmospheric layers, and sparse chords.',
    status: 'Open'
  },
  {
    id: 'label_110',
    name: 'Fuse Records',
    email: 'demos@fuserecords.pt',
    website: 'https://fuse.pt',
    instagram: '@fuserecords',
    genre: 'Minimal / Deep Tech',
    region: 'Lisbon, Portugal 🇵🇹',
    notes: 'Leading record label in the Lisbon underground scene. Looking for heavy, raw, minimal tech-house grooves with strong rhythmic energy.',
    bestFitDescription: 'Punchy 909 rimshots, rolling vintage sub basslines, hypnotic vocal chops, and simple modular bleeps.',
    status: 'Open'
  },
  {
    id: 'label_111',
    name: 'Super Flu (Artist Promo)',
    email: 'promos@super-flu.de',
    website: 'https://super-flu.de',
    instagram: '@superflu_music',
    genre: 'Melodic House',
    region: 'Halle, Germany 🇩🇪',
    notes: 'Quirky electronic duo. Sourcing orchestral melodic house, weird horns, acoustic violin chops, and humorous/funky electronic hooks.',
    bestFitDescription: 'Surreal acoustic horns, classical string instrument edits, highly custom synth textures, and organic house claps.',
    status: 'Open'
  },
  {
    id: 'label_112',
    name: 'Andhim (Artist Promo)',
    email: 'promos@andhim.de',
    website: 'https://andhim.de',
    instagram: '@andhim_music',
    genre: 'House',
    region: 'Cologne, Germany 🇩🇪',
    notes: 'Creators of the self-described "Super House" subgenre. Looking for immensely positive, energetic house tracks with rich sample work.',
    bestFitDescription: 'Happy acoustic piano loops, bright brass sections, organic live handclaps, and bouncy bass guitar loops.',
    status: 'Open'
  },
  {
    id: 'label_113',
    name: 'Monaberry',
    email: 'demos@monaberry.de',
    website: 'https://monaberry.de',
    instagram: '@monaberry_de',
    genre: 'Melodic House',
    region: 'Halle, Germany 🇩🇪',
    notes: 'German boutique label. Sourcing quirky, melodic house, bouncy indie-dance synths, and characterful electronic compositions.',
    bestFitDescription: 'Whimsical lead synthesizers, bouncy retro bass sequences, off-beat organic percussion, and warm soundscapes.',
    status: 'Open'
  },
  {
    id: 'label_114',
    name: 'Diynamic Resident Showcase (Artist Promo)',
    email: 'diynamic.demos@diynamic.com',
    website: 'https://diynamic.com',
    instagram: '@diynamicmusic',
    genre: 'Melodic House',
    region: 'Hamburg, Germany 🇩🇪',
    notes: 'Showcase curation for Diynamic’s global resident roster. High demand for energetic, dark-themed progressive indie house.',
    bestFitDescription: 'Heavy sidechained synth bass, punchy snare structures, minor key arpeggios, and energetic sound sweeps.',
    status: 'Open'
  },
  {
    id: 'label_115',
    name: 'Swiss House Collective',
    email: 'music@swisshousecollective.ch',
    website: 'https://swisshousecollective.ch',
    instagram: '@swisshousecollective',
    genre: 'Deep House',
    region: 'Zurich, Switzerland 🇨🇭',
    notes: 'Swiss network dedicated to deep, soulful, highly elegant real house sounds. Seeking organic Rhodes details, gentle jazzy hats, and deep vocals.',
    bestFitDescription: 'Soulful electric piano progressions, warm double-bass simulator, smooth room reverbs, and acoustic shaker loops.',
    status: 'Open'
  },
  {
    id: 'label_116',
    name: 'Stay True Sounds',
    email: 'demos@staytruesounds.com',
    website: 'https://staytruesounds.com',
    instagram: '@staytruesounds',
    genre: 'Deep House',
    region: 'Johannesburg, South Africa 🇿🇦',
    notes: 'Independent South African label run by Kid Fonque. Championing pure, high-fidelity deep house, jazzy chords, and deep electronic warmth.',
    bestFitDescription: 'Lush Rhodes electric chords, rolling deep bass frequencies, clean warm organic vocal templates, and slow-shaking tambourines.',
    status: 'Open'
  },
  {
    id: 'label_117',
    name: 'Kid Fonque (Artist Promo)',
    email: 'fonque@staytruesounds.com',
    website: 'https://staytruesounds.com',
    instagram: '@kidfonque',
    genre: 'Deep House',
    region: 'Johannesburg, South Africa 🇿🇦',
    notes: 'South African tastemaker and Stay True boss. Looking for modern electronic deep house, alternative spoken word, and soulful cuts.',
    bestFitDescription: 'Poetic spoken word vocal overlays, jazzy key progressions, and deep soulful analog house structures.',
    status: 'Open'
  },
  {
    id: 'label_118',
    name: 'Black Coffee (Artist Promo)',
    email: 'promos@blackcoffee.dj',
    website: 'https://blackcoffee.dj',
    instagram: '@realblackcoffee',
    genre: 'Afro House',
    region: 'Durban, South Africa 🇿🇦',
    notes: 'The pioneer of modern Afro House on the global stage. Sourcing beautiful organic afro rhythms, emotional piano cords, and soaring vocal arrangements.',
    bestFitDescription: 'Spiritual vocal chants, rich organic conga sequences, gentle synth waves, and elegant simple bass templates.',
    status: 'Open'
  },
  {
    id: 'label_119',
    name: 'Soulistic Music',
    email: 'demos@soulisticmusic.co.za',
    website: 'https://soulisticmusic.co.za',
    instagram: '@soulisticmusic',
    genre: 'Afro House',
    region: 'Johannesburg, South Africa 🇿🇦',
    notes: 'South African giant imprint founded by Black Coffee. Focuses on premium, soul-refreshing afro-tech and acoustic afro house masterpieces.',
    bestFitDescription: 'Impeccable acoustic afro drum grids, uplifting soulful vocal solos, beautiful piano pieces, and subtle warm sub bass.',
    status: 'Open'
  },
  {
    id: 'label_120',
    name: 'Shimza (Artist Promo)',
    email: 'promos@shimza.dj',
    website: 'https://shimza.dj',
    instagram: '@shimza.dj',
    genre: 'Afro House',
    region: 'Johannesburg, South Africa 🇿🇦',
    notes: 'Afro-tech king Shimza. Demands complex, high-energy, heavy percussive afro-tech weapons with immense mainstage dynamic power.',
    bestFitDescription: 'Rapid energetic organic hand drumming, powerful dramatic synth risers, and heavy dynamic baseline drops.',
    status: 'Open'
  },
  {
    id: 'label_121',
    name: 'Kunye',
    email: 'demos@kunye.com',
    website: 'https://kunye.com',
    instagram: '@kunye_recs',
    genre: 'Afro House',
    region: 'Johannesburg, South Africa 🇿🇦',
    notes: 'Record label showcasing rich African heritage within electronic rhythms. Sourcing afro house, electronic tribal patterns, and warm vocal tracks.',
    bestFitDescription: 'Tribal percussion loops, spiritual African language vocal hooks, warm synth pad configurations, and subtle organic drums.',
    status: 'Open'
  },
  {
    id: 'label_122',
    name: 'Sweat It Out',
    email: 'demos@sweatitoutmusic.com',
    website: 'https://sweatitoutmusic.com',
    instagram: '@sweatitoutmusic',
    genre: 'Tech House',
    region: 'Sydney, Australia 🇦🇺',
    notes: 'Highly active Australian label. Seeking catchy, dance-pop influenced tech-house, summer vibes, upbeat grooves, and high-energy vocals.',
    bestFitDescription: 'Bright positive vocal hooks, happy upbeat baseline layers, and crisp fast-paced electronic drums.',
    status: 'Open'
  },
  {
    id: 'label_123',
    name: 'Club Sweat',
    email: 'submissions@clubsweat.com.au',
    website: 'https://clubsweat.com.au',
    instagram: '@clubsweat',
    genre: 'Tech House',
    region: 'Sydney, Australia 🇦🇺',
    notes: 'Sweat It Out’s club division. Prioritizes pure club-designed tech house, rolling bass loops, and dynamic sub-bass weapons for DJs.',
    bestFitDescription: 'Rolling analog tech-house basslines, clear dry house claps, energetic vocal build loops.',
    status: 'Open'
  },
  {
    id: 'label_124',
    name: 'Tokyo House Underground',
    email: 'demos@tokyounderground.jp',
    website: 'https://tokyounderground.jp',
    instagram: '@tokyounderground',
    genre: 'Deep House',
    region: 'Tokyo, Japan 🇯🇵',
    notes: 'Intimate collective supporting deep house and classic garage in Tokyo. Prefers vintage gear textures, analog tape hiss, and jazzy melodies.',
    bestFitDescription: 'Vintage 909/808 drum loops, warm delayed synth chords, analog tape saturation, and cozy lounge chords.',
    status: 'Open'
  },
  {
    id: 'label_125',
    name: 'Satoshi Tomiie (Artist Promo)',
    email: 'promos@satoshitomiie.com',
    website: 'https://satoshitomiie.com',
    instagram: '@satoshitomiie',
    genre: 'Minimal / Deep Tech',
    region: 'Tokyo, Japan 🇯🇵',
    notes: 'Legendary producer Satoshi Tomiie. Sourcing highly detailed minimal-deep tech, live modular performances, and pure abstract house.',
    bestFitDescription: 'Elaborate modular filter sweets, abstract drum machine syncopation, warm delicate sub-frequencies, and minimal vocals.',
    status: 'Open'
  },
  {
    id: 'label_126',
    name: 'Yoyaku',
    email: 'demos@yoyaku.io',
    website: 'https://yoyaku.io',
    instagram: '@yoyaku_recordstore',
    genre: 'Minimal / Deep Tech',
    region: 'Paris, France 🇫🇷',
    notes: 'Elite Parisian vinyl store and record label. Seeking hypnotic, highly intelligent minimal, micro-house loop structures, and elegant breakbeats.',
    bestFitDescription: 'Swinging micro-percussion elements, warm acoustic record noise, deep looping sub baselines, and highly hypnotic structures.',
    status: 'Open'
  },
  {
    id: 'label_127',
    name: 'Apollonia (Artist Promo)',
    email: 'promos@apolloniamusic.com',
    website: 'https://instagram.com/apolloniamusic',
    instagram: '@apolloniamusic',
    genre: 'Minimal / Deep Tech',
    region: 'Paris, France 🇫🇷',
    notes: 'Parisian trio Apollonia. Sourcing underground, vinyl-ready 90s-inspired minimal house, bouncy tech-house, and groovy deep beats.',
    bestFitDescription: 'Highly energetic 90s swinging hats, fat vintage organ basslines, retro vocal edits, and snappy acoustic claps.',
    status: 'Open'
  },
  {
    id: 'label_128',
    name: 'Rex Club Resident (Artist Promo)',
    email: 'promos@rexclubparis.com',
    website: 'https://rexclub.com',
    instagram: '@rexclub',
    genre: 'Deep House',
    region: 'Paris, France 🇫🇷',
    notes: 'Direct submission to long-term resident roster of Rex Club. Looking for sophisticated deep house tools, rolling tech grooves, and dark atmospheres.',
    bestFitDescription: 'Very deep subterranean baselines, organic warm synth pads, vintage drum machinery warmth, and smooth progression.',
    status: 'Open'
  },
  {
    id: 'label_129',
    name: 'Stereo Montreal (Club Showcase)',
    email: 'submissions@stereomontreal.com',
    website: 'https://stereomontreal.com',
    instagram: '@stereomontreal',
    genre: 'Deep House',
    region: 'Montreal, Canada 🇨🇦',
    notes: 'Acclaimed audiophile club famed for its unparalleled sound system. Resident programmers review deep progressive house, hypnotic tech-house, and warm electronics.',
    bestFitDescription: 'Extremely detailed pristine sub-bass layers, floating stereo delay chords, and progressive hypnotic structures.',
    status: 'Open'
  },
  {
    id: 'label_130',
    name: 'Turbo Recordings',
    email: 'demos@turborecordings.com',
    website: 'https://turborecordings.com',
    instagram: '@turborecordings',
    genre: 'Electronic / Other',
    region: 'Montreal, Canada 🇨🇦',
    notes: 'Famous imprint run by Tiga. Seeking modern electro house, witty raw techno, acid lines, and leftfield electronic club weapons.',
    bestFitDescription: 'Aggressive analog modular synths, humorous or robotic vocal tracks, and heavy raw metallic warehouse drums.',
    status: 'Open'
  },
  {
    id: 'label_131',
    name: 'Tiga (Artist Promo)',
    email: 'promos@tiga.ca',
    website: 'https://tiga.ca',
    instagram: '@tiga',
    genre: 'Electronic / Other',
    region: 'Montreal, Canada 🇨🇦',
    notes: 'Electro icon Tiga’s promo box. Demands futuristic synth-pop, groovy raw electro-house, 80s arpeggiated bass sequences, and unique elements.',
    bestFitDescription: 'Arpeggating 80s synthesizer templates, quirky high-concept vocals, and simple punchy drum machine dynamics.',
    status: 'Open'
  },
  {
    id: 'label_132',
    name: 'Copenhagen Underground',
    email: 'demos@copenhagenunderground.dk',
    website: 'https://copenhagenunderground.dk',
    instagram: '@cphunderground',
    genre: 'Minimal / Deep Tech',
    region: 'Copenhagen, Denmark 🇩🇰',
    notes: 'Danish collective curating deep space minimal, organic warm loops, and intelligent microtonal house.',
    bestFitDescription: 'Dusty click-loops, ultra-low frequency sub-bass, organic background breeze layers, and minimalistic synths.',
    status: 'Open'
  },
  {
    id: 'label_133',
    name: 'Kiasmos (Artist Promo)',
    email: 'promos@kiasmos.is',
    website: 'https://instagram.com/kiasmos_',
    instagram: '@kiasmos_',
    genre: 'Melodic House',
    region: 'Reykjavik, Iceland 🇮🇸',
    notes: 'Atmospheric neo-classical electronic duo. Looking for beautiful acoustic violin layouts, delicate grand piano chords, and clean minimal digital rhythms.',
    bestFitDescription: 'Delicate acoustic grand piano, digital minimal ambient noise, gorgeous sweeping violins, and slow warm kicks.',
    status: 'Open'
  },
  {
    id: 'label_134',
    name: 'Drumcode Records',
    email: 'demos@drumcode.se',
    website: 'https://drumcode.se',
    instagram: '@drumcodeofficial',
    genre: 'Electronic / Other',
    region: 'Stockholm, Sweden 🇸🇪',
    notes: 'Sweedish techno giant run by Adam Beyer. Sourcing high impact peak-time mainstage techno, heavy kick drums, and rolling warehouse synthesizers.',
    bestFitDescription: 'Monstrous distorted kickoff, rapid sharp hi-hat grids, massive sweeps, and dense driving industrial patterns.',
    status: 'Open'
  },
  {
    id: 'label_135',
    name: 'Adam Beyer (Artist Promo)',
    email: 'promos@drumcode.se',
    website: 'https://drumcode.se',
    instagram: '@realadambeyer',
    genre: 'Electronic / Other',
    region: 'Stockholm, Sweden 🇸🇪',
    notes: 'Drumcode commander Adam Beyer. Seeking stadium-ready peak-time techno anthems, massive builds, and dark massive vocal overlays.',
    bestFitDescription: 'Very heavy sidechained synthetic basslines, industrial scale reverb units, and loud high-contrast drops.',
    status: 'Open'
  },
  {
    id: 'label_136',
    name: 'Oslated',
    email: 'demos@oslated.com',
    website: 'https://oslated.bandcamp.com',
    instagram: '@oslated_seoul',
    genre: 'Deep House',
    region: 'Seoul, South Korea 🇰🇷',
    notes: 'Atmospheric and organic deep-tech label from South Korea. Sourcing ambient deep house, ritual percussions, and modular space environments.',
    bestFitDescription: 'Extremely deep delayed synth space pads, gentle ritual hand drumming, and organic atmospheric textures.',
    status: 'Open'
  },
  {
    id: 'label_137',
    name: 'Bound Seoul (Club Showcase)',
    email: 'curator@boundseoul.kr',
    website: 'https://boundseoul.kr',
    instagram: '@bound.seoul',
    genre: 'Tech House',
    region: 'Seoul, South Korea 🇰🇷',
    notes: 'Premium Gangnam underground space. Reviewing high velocity bouncy tech-house and groovy minimal tech heaters that supply early morning lines.',
    bestFitDescription: 'Punchy heavy-compressed kick drums, elastic vocal edits, and rapid clattering hi-hat patterns.',
    status: 'Open'
  },
  {
    id: 'label_138',
    name: 'Hernan Cattaneo (Artist Promo)',
    email: 'promos@hernancattaneo.com',
    website: 'https://hernancattaneo.com',
    instagram: '@djhernancattaneo',
    genre: 'Melodic House',
    region: 'Buenos Aires, Argentina 🇦🇷',
    notes: 'The Godfather of progressive house. Sourcing high-fidelity melodic journeys, deep progressive grooves, beautiful chords, and long epic builds.',
    bestFitDescription: 'Lush slowly-developing pads, clean sparkling modular arpeggios, in-depth sub line curves, and smooth acoustic hats.',
    status: 'Open'
  },
  {
    id: 'label_139',
    name: 'Sudbeat Music',
    email: 'demos@sudbeat.com',
    website: 'https://sudbeat.com',
    instagram: '@sudbeatmusic',
    genre: 'Melodic House',
    region: 'Buenos Aires, Argentina 🇦🇷',
    notes: 'Hernan Cattaneo’s elite progressive imprint. Demands supreme melodic structures, warm sound designs, and intellectual progressive developments.',
    bestFitDescription: 'Soaring background synth chords, intricate clean progressive patterns, and deep warm baseline dynamics.',
    status: 'Open'
  },
  {
    id: 'label_140',
    name: 'Crobar Buenos Aires (Club Showcase)',
    email: 'promos@crobar.com.ar',
    website: 'https://crobar.com.ar',
    instagram: '@crobarargentina',
    genre: 'Tech House',
    region: 'Buenos Aires, Argentina 🇦🇷',
    notes: 'Elite electronic venue in Buenos Aires. Sourcing peak-hour tech house weapons, rolling sub basslines, and high-energy festival drops.',
    bestFitDescription: 'Energetic building snare drums, fat commercial-grade basslines, and high-vibe vocal stabs.',
    status: 'Open'
  },
  {
    id: 'label_141',
    name: 'Nites Amsterdam',
    email: 'demos@nitesamsterdam.nl',
    website: 'https://nitesamsterdam.nl',
    instagram: '@nitesamsterdam',
    genre: 'House',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Sourcing sleek, modern late-night house beats, groovy vocal lines, and warm 909-infused club rhythms.',
    bestFitDescription: 'Classic 909 house percussion layers, warm Rhodes chords, and groovy walking baselines.',
    status: 'Open'
  },
  {
    id: 'label_142',
    name: 'Baramericas (Club Showcase)',
    email: 'promos@baramericas.com.mx',
    website: 'https://baramericas.com.mx',
    instagram: '@baramericas',
    genre: 'Tech House',
    region: 'Guadalajara, Mexico 🇲🇽',
    notes: 'Legendary subterranean Mexican club. Resident curation reviews rolling dirty tech-house, funky elements, and energetic vocal tools.',
    bestFitDescription: 'Deep rolling bassline, funky cowbell stabs, energetic spoken vocal tracks, and solid claps.',
    status: 'Open'
  },
  {
    id: 'label_143',
    name: 'D-Edge Records',
    email: 'demos@d-edgerecords.com.br',
    website: 'https://d-edge.com.br',
    instagram: '@dedgerecords',
    genre: 'Minimal / Deep Tech',
    region: 'São Paulo, Brazil 🇧🇷',
    notes: 'Releasing cutting-edge underground techno, minimal tech, and detailed electronic grooves associated with Renato Ratier’s iconic club.',
    bestFitDescription: 'Detailed micro-percussion setups, raw analog synthesizer loops, and dark hypnotic sub-bass lines.',
    status: 'Open'
  },
  {
    id: 'label_144',
    name: 'Renato Ratier (Artist Promo)',
    email: 'ratier.promos@d-edge.com.br',
    website: 'https://d-edge.com.br',
    instagram: '@renatoratier',
    genre: 'Tech House',
    region: 'São Paulo, Brazil 🇧🇷',
    notes: 'D-Edge club owner Renato Ratier. Looking for dark, elegant, grooving deep-tech and peak tech house with a high-fidelity underground feel.',
    bestFitDescription: 'Elegantly dark tech chords, tight bouncy percussion layouts, and highly processed sub basslines.',
    status: 'Open'
  },
  {
    id: 'label_145',
    name: 'BA Underground',
    email: 'demos@baunderground.com.ar',
    website: 'https://baunderground.com.ar',
    instagram: '@baunderground',
    genre: 'Deep House',
    region: 'Buenos Aires, Argentina 🇦🇷',
    notes: 'Argentinian deep house platform. Championing warm synth layers, laid-back house grooves, and organic drum sequences.',
    bestFitDescription: 'Warm organic pads, cozy delayed synth sweeps, and laid-back hand clapping beats.',
    status: 'Open'
  },
  {
    id: 'label_146',
    name: 'Coda Toronto (Club Showcase)',
    email: 'promos@codatoronto.com',
    website: 'https://codatoronto.com',
    instagram: '@codatoronto',
    genre: 'Tech House',
    region: 'Toronto, Canada 🇨🇦',
    notes: 'Torontos underground playground. Sourcing energetic, baseline-focused tech-house heater loops and minimal deep tech tracks.',
    bestFitDescription: 'Thick driving bassline layers, crisp high-end hi-hat patterns, and short energetic vocal loops.',
    status: 'Open'
  },
  {
    id: 'label_147',
    name: 'All Day I Dream',
    email: 'demos@alldayidream.com',
    website: 'https://alldayidream.com',
    instagram: '@alldayidreamofficial',
    genre: 'Deep House',
    region: 'New York, United States 🇺🇸',
    notes: 'Lee Burridge’s globally beloved brand. Sourcing beautiful, melancholic dreamy house, light acoustic percussion, and organic melodic structures.',
    bestFitDescription: 'Gentle acoustic shaker beds, beautiful minor-key acoustic leads, soaring thin string chords, and spiritual vocal notes.',
    status: 'Open'
  },
  {
    id: 'label_148',
    name: 'Lee Burridge (Artist Promo)',
    email: 'promos@alldayidream.com',
    website: 'https://instagram.com/leeburridge',
    instagram: '@leeburridge',
    genre: 'Deep House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Beloved dreamer Lee Burridge. Looking for beautiful, sun-drenched organic house, uplifting melodic sweeps, and slow-moving deep emotional grooves.',
    bestFitDescription: 'Nostalgic organic glockenspiel or bell sequences, soft delayed synth pads, and warm acoustic percussion grids.',
    status: 'Open'
  },
  {
    id: 'label_149',
    name: 'Dirtybird Records',
    email: 'demos@dirtybirdrecords.com',
    website: 'https://dirtybirdrecords.com',
    instagram: '@dirtybirdrecords',
    genre: 'Tech House',
    region: 'San Francisco, United States 🇺🇸',
    notes: 'The standard of quirky, bass-heavy West Coast tech house. Sourcing heavy modular 808 sub bass, bizarre sound concepts, and vocal cuts.',
    bestFitDescription: 'Giant detuned 808 sub-bass stabs, comical/weird vocal hooks, and dry robotic percussion structures.',
    status: 'Open'
  },
  {
    id: 'label_150',
    name: 'Claude VonStroke (Artist Promo)',
    email: 'promos@dirtybirdrecords.com',
    website: 'https://instagram.com/vonstroke',
    instagram: '@claudevonstroke',
    genre: 'Tech House',
    region: 'San Francisco, United States 🇺🇸',
    notes: 'Legendary Dirtybird founder VonStroke. Demands heavy-duty booty-tech-house, playful structures, modular synth drops, and maximum low-end power.',
    bestFitDescription: 'Deep bouncing low-ends, funny spoken word, and minimal high-frequency elements over massive rhythms.',
    status: 'Open'
  },
  {
    id: 'label_151',
    name: 'Green Velvet (Artist Promo)',
    email: 'promos@reliefrecords.com',
    website: 'https://green-velvet.com',
    instagram: '@greenvelvet',
    genre: 'Tech House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Chicago techno and house pioneer. Demands high energy jackin house, quirky vocal commentaries, retro synth hits, and screaming leads.',
    bestFitDescription: 'Jackin 909 drum sets, vocal monologues with high delay, and bright energetic synthesizer stabs.',
    status: 'Open'
  },
  {
    id: 'label_152',
    name: 'Relief Records',
    email: 'demos@reliefrecords.com',
    website: 'https://instagram.com/reliefrecords',
    instagram: '@reliefrecords',
    genre: 'Tech House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Green Velvet’s energetic Relief brand. Seeking peak-time club weapons, jackin drum grids, aggressive acid elements, and rolling sub bass.',
    bestFitDescription: 'Heavily energetic sidechained drums, shouting vocal loops, and industrial-style acid line transitions.',
    status: 'Open'
  },
  {
    id: 'label_153',
    name: 'Cajual Records',
    email: 'demos@cajualrecords.com',
    website: 'https://instagram.com/cajualrecords',
    instagram: '@cajualrecords',
    genre: 'House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Historical Chicago house imprint. Sourcing dirty house, funky organ rhythms, real diva vocal lines, and old school drum machines.',
    bestFitDescription: 'Soulful organ synth riffs, heavy jackin hats, classic vocal house lines, and very groovy basslines.',
    status: 'Open'
  },
  {
    id: 'label_154',
    name: 'Ghostly International',
    email: 'demos@ghostly.com',
    website: 'https://ghostly.com',
    instagram: '@ghostly',
    genre: 'Electronic / Other',
    region: 'Detroit, United States 🇺🇸',
    notes: 'Art and design electronic incubator. Sourcing high-concept indie-dance, micro-house, elegant IDM, and leftfield electronic songs.',
    bestFitDescription: 'Highly unique melodic synths, warm dusty beats, complex digital elements, and lo-fi warmth.',
    status: 'Open'
  },
  {
    id: 'label_155',
    name: 'Moodymann (Artist Promo)',
    email: 'promos@mahoganimusic.com',
    website: 'https://mahoganimusic.com',
    instagram: '@moodymann_313',
    genre: 'House',
    region: 'Detroit, United States 🇺🇸',
    notes: 'The enigmatic Detroit house legend. Looking for deep, dusty, blues and soul-infused house loops, live guitar/bass licks, and raw black music energy.',
    bestFitDescription: 'Dusty vinyl-crackle loops, live jazz bass guitar lines, spoken-word crowd chatter, and soulful vocal keys.',
    status: 'Open'
  },
  {
    id: 'label_156',
    name: 'Defora Records',
    email: 'demos@deforarecords.com',
    website: 'https://deforarecords.com',
    instagram: '@deforarecords',
    genre: 'Minimal / Deep Tech',
    region: 'Venice, Italy 🇮🇹',
    notes: 'Artistic Italian minimal label. Looking for high quality deep minimalist cuts, microtonic click arrangements, and vintage analog synth loops.',
    bestFitDescription: 'Highly clear mechanical clicking patterns, simple deep sub baselines, and warm tape delay sweeps.',
    status: 'Open'
  },
  {
    id: 'label_157',
    name: 'Etruria Beat',
    email: 'demos@etruriabeat.com',
    website: 'https://etruriabeat.com',
    instagram: '@etruriabeat',
    genre: 'Electronic / Other',
    region: 'Florence, Italy 🇮🇹',
    notes: 'Luca Agnelli’s high impact techno imprint. Sourcing industrial warehouse rolling tracks, acid line loops, and heavy kicks.',
    bestFitDescription: 'Massive heavy industrial kick drum configurations, rapid modular synth filters, and industrial soundscapes.',
    status: 'Open'
  },
  {
    id: 'label_158',
    name: 'Luca Agnelli (Artist Promo)',
    email: 'promos@lucaagnelli.com',
    website: 'https://lucaagnelli.com',
    instagram: '@lucaagnelli',
    genre: 'Electronic / Other',
    region: 'Florence, Italy 🇮🇹',
    notes: 'Etruria Beat boss. Seeking high velocity club techno, dark acid arpeggiators, and massive peak-time festival tracks.',
    bestFitDescription: 'Hyper velocity acid lines, colossal industrial kicks, and dark spoken robotic phrases.',
    status: 'Open'
  },
  {
    id: 'label_159',
    name: 'Suara',
    email: 'demos@suara-music.com',
    website: 'https://suara-store.com',
    instagram: '@suaratemple',
    genre: 'Tech House',
    region: 'Barcelona, Spain 🇪🇸',
    notes: 'Globally renowned Spanish cat-themed imprint run by Coyu. Sourcing peak-hour tech house, rolling baselines, and catchy vocal loops.',
    bestFitDescription: 'Groovy rolling bass layers, snappy dry house clapping, and high-vibe vocal edit templates.',
    status: 'Open'
  },
  {
    id: 'label_160',
    name: 'Coyu (Artist Promo)',
    email: 'promos@suara-music.com',
    website: 'https://instagram.com/coyumusic',
    instagram: '@coyumusic',
    genre: 'Tech House',
    region: 'Barcelona, Spain 🇪🇸',
    notes: 'Suara boss Coyu. Seeking club-centric bouncy tech-house, high tech grooves, and massive dancefloor building transitions.',
    bestFitDescription: 'Elastic synthesizers, bouncy cowbells, clean house loops, and high energy transition sweeps.',
    status: 'Open'
  },
  {
    id: 'label_161',
    name: 'Input High Fidelity (Club Showcase)',
    email: 'promos@inputbcn.com',
    website: 'https://inputbcn.com',
    instagram: '@inputhighfidelity',
    genre: 'Tech House',
    region: 'Barcelona, Spain 🇪🇸',
    notes: 'Famous Barcelona club boasting a supreme function-one sound system. Programmers evaluate rolling tech house and deep-tech elements.',
    bestFitDescription: 'Rolling MPC tech house grooves, crystal clear highs, and warm dynamic sub bass layers.',
    status: 'Open'
  },
  {
    id: 'label_162',
    name: 'Razzmatazz (Club Showcase)',
    email: 'demos@salarazzmatazz.com',
    website: 'https://salarazzmatazz.com',
    instagram: '@salarazzmatazz',
    genre: 'Electronic / Other',
    region: 'Barcelona, Spain 🇪🇸',
    notes: 'Huge multi-room Spanish concert club. Programmers review high energy techno, electronic indie beats, and industrial club projects.',
    bestFitDescription: 'Aggressive analog arpeggios, loud high-contrast drums, and dark vocal atmospheres.',
    status: 'Open'
  },
  {
    id: 'label_163',
    name: 'Elrow Music',
    email: 'demos@elrowsounds.com',
    website: 'https://elrow.com',
    instagram: '@elrowofficial',
    genre: 'Tech House',
    region: 'Barcelona, Spain 🇪🇸',
    notes: 'Record label of the worlds most colorful and chaotic party catalog. Seeking hyper-bouncy, insanely happy, dynamic, and crazy tech-house.',
    bestFitDescription: 'Joyous brass stabs, comical whistle elements, bouncy basslines, and cheerful organic clapping loops.',
    status: 'Open'
  },
  {
    id: 'label_164',
    name: 'Barbarella Club (Club Showcase)',
    email: 'promos@barbarellaclub.com',
    website: 'https://barbarellaclub.com',
    instagram: '@barbarellaorlando',
    genre: 'Tech House',
    region: 'Orlando, United States 🇺🇸',
    notes: 'Florida underground club showcase. Seeking rolling tech-house, bass-driven elements, and peak vocal tools to keep the dancers moving.',
    bestFitDescription: 'Rolling tech-house baselines, snappy digital drum grids, and warm house synth stabs.',
    status: 'Open'
  },
  {
    id: 'label_165',
    name: 'Carpe Diem Hvar (Club Showcase)',
    email: 'promos@carpe-diem-hvar.com',
    website: 'https://carpe-diem-hvar.com',
    instagram: '@carpediemhvar',
    genre: 'Deep House',
    region: 'Hvar, Croatia 🇭🇷',
    notes: 'Stunning open-air beach club in Croatia. Resident DJs look for beautiful progressive melodic deep house, sun-ready sax loops, and happy chords.',
    bestFitDescription: 'Uplifting acoustic saxophone loops, tropical hand-conga patterns, warm soft chords, and breezy deep vocals.',
    status: 'Open'
  },
  {
    id: 'label_166',
    name: 'Anjunadeep',
    email: 'demos@anjunadeep.com',
    website: 'https://anjunadeep.com',
    instagram: '@anjunadeep',
    genre: 'Melodic House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'The industry leader in beautiful, cinematic, and progressive emotional deep house. Sourcing delicate acoustic strings, rich vocal storytelling, and warm beats.',
    bestFitDescription: 'Cinematic modular chords, beautiful acoustic strings, lush delicate male/female vocal leads, and warm master compressions.',
    status: 'Open'
  },
  {
    id: 'label_167',
    name: 'Jody Wisternoff (Artist Promo)',
    email: 'promos@jodywisternoff.com',
    website: 'https://jodywisternoff.com',
    instagram: '@jodywisternoff',
    genre: 'Melodic House',
    region: 'Bristol, United Kingdom 🇬🇧',
    notes: 'Anjunadeep legend Jody Wisternoff. Seeking rich, breakbeat-infused progressive house, emotional synths, and retro electronic details.',
    bestFitDescription: 'Atmospheric breakbeat grids, beautiful warm 80s synth sweeps, and epic melancholic melodies.',
    status: 'Open'
  },
  {
    id: 'label_168',
    name: 'Above & Beyond (Artist Promo)',
    email: 'promos@anjunabeats.com',
    website: 'https://aboveandbeyond.nu',
    instagram: '@aboveandbeyond',
    genre: 'Melodic House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Electronic superstars Above & Beyond. High demand for progressive, emotional, epic-scale vocal melodic house built for arena crowds.',
    bestFitDescription: 'Colossal soaring melodic chords, epic vocal sweeps, massive transition builders, and high-impact bass drops.',
    status: 'Open'
  },
  {
    id: 'label_169',
    name: 'This Never Happened',
    email: 'demos@thisneverhappened.com',
    website: 'https://thisneverhappened.com',
    instagram: '@thisneverhappened',
    genre: 'Melodic House',
    region: 'Denver, United States 🇺🇸',
    notes: 'Lane 8’s phone-free record label imprint. Demands hyper-melodic, nostalgic, emotional, and progressive house focused on pristine melodies.',
    bestFitDescription: 'Intensely nostalgic synth melodies, warm rolling baseline textures, and beautiful delicate acoustic-style vocals.',
    status: 'Open'
  },
  {
    id: 'label_170',
    name: 'Lane 8 (Artist Promo)',
    email: 'promos@thisneverhappened.com',
    website: 'https://lane8music.com',
    instagram: '@lane8music',
    genre: 'Melodic House',
    region: 'Denver, United States 🇺🇸',
    notes: 'Lane 8’s personal promo curation. Looking for beautiful, highly emotional, sweeping progressive melodic house containing gorgeous vocals.',
    bestFitDescription: 'Emotional ambient string pads, bright simple progressive synth melodies, and warm clear drums.',
    status: 'Open'
  },
  {
    id: 'label_171',
    name: 'Fuse Brussels (Club Showcase)',
    email: 'promos@fuse.be',
    website: 'https://fuse.be',
    instagram: '@fusebrussels',
    genre: 'Electronic / Other',
    region: 'Brussels, Belgium 🇧🇪',
    notes: 'Legendary Brussels techno institution. Sourcing dark mechanical techno, industrial warehouse loops, and hard-hitting electronic tracks.',
    bestFitDescription: 'Heavy mechanical kick layouts, dark warehouse room reverb, and screaming acid synthesizers.',
    status: 'Open'
  },
  {
    id: 'label_172',
    name: 'Kincaid (Label)',
    email: 'demos@kincaidrecs.be',
    website: 'https://instagram.com/kincaid_be',
    instagram: '@kincaidrecs',
    genre: 'Deep House',
    region: 'Brussels, Belgium 🇧🇪',
    notes: 'Belgian boutique house platform. Seeking deep analog house tracks, warm Rhodes patterns, and sophisticated club tools.',
    bestFitDescription: 'Warm Rhodes vintage chords, smooth cozy basslines, and crisp organic percussion grids.',
    status: 'Open'
  },
  {
    id: 'label_173',
    name: 'Sunburn Festival Resident (Artist Promo)',
    email: 'promos@sunburn.in',
    website: 'https://sunburn.in',
    instagram: '@sunburnfestival',
    genre: 'Electronic / Other',
    region: 'Goa, India 🇮🇳',
    notes: 'Sourcing massive, energetic mainstage electronics, rolling progressive psy-basslines, and ethnic-flavored vocal hooks for massive crowds.',
    bestFitDescription: 'Stadium-scale rising lead synthesizers, massive heavy bass frequencies, and high-impact crowd-pleaser sweeps.',
    status: 'Open'
  },
  {
    id: 'label_174',
    name: 'Alchemist Bar Nairobi (Club Showcase)',
    email: 'demos@alchemistbar.com',
    website: 'https://alchemistbar.com',
    instagram: '@alchemistnairobi',
    genre: 'Afro House',
    region: 'Nairobi, Kenya 🇰🇪',
    notes: 'Dynamic open-air artsy venue in Kenya. Curating soulful Afro House, organic percussions, deep electronic house, and local melodies.',
    bestFitDescription: 'Rich organic ethnic drums, warm deep house pads, beautiful vocal harmonies, and gentle bass loops.',
    status: 'Open'
  },
  {
    id: 'label_175',
    name: 'Bassiani (Club Showcase)',
    email: 'demos@bassiani.com',
    website: 'https://bassiani.com',
    instagram: '@bassiani',
    genre: 'Electronic / Other',
    region: 'Tbilisi, Georgia 🇬🇪',
    notes: 'The direct cathedral of modern dark techno. Sourcing dark, heavy, mechanical industrial acid lines, massive concrete kicks, and trippy sweeps.',
    bestFitDescription: 'Distorted massive warehouse kicks, raw mechanical synthesizer sequences, and intense echo effects.',
    status: 'Open'
  },
  {
    id: 'label_176',
    name: 'Space Ibiza Classics',
    email: 'promos@spaceibiza.com',
    website: 'https://spaceibiza.com',
    instagram: '@spaceibiza.official',
    genre: 'House',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Releasing retro classic house edits and euphoric club anthems channeling Ibiza’s golden era. Prefers active 909 beats and classic vocals.',
    bestFitDescription: 'Classic 909 drums, bright piano motifs, soaring summer vocal hooks, and warm groovy basslines.',
    status: 'Open'
  },
  {
    id: 'label_177',
    name: 'Glitterbox Resident DJs (Artist Promo)',
    email: 'glitterbox.promos@glitterboxibiza.com',
    website: 'https://glitterboxibiza.com',
    instagram: '@glitterboxibiza',
    genre: 'Disco House',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Resident DJs on rotation at Glitterbox Ibiza. Looking for energetic, funky, organic disco house loop edits with massive crowd reaction.',
    bestFitDescription: 'Slap basslines, organic bongos/tambourines, upbeat horn loops, and joyful vocal melodies.',
    status: 'Open'
  },
  {
    id: 'label_178',
    name: 'Defected Resident Syndicate (Artist Promo)',
    email: 'syndicate@defected.com',
    website: 'https://defected.com',
    instagram: '@defectedrecords',
    genre: 'House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Curated pool of Defected records resident DJs. Sourcing high quality soulful, energetic classic house music to play in worldwide showcases.',
    bestFitDescription: 'Uplifting diva house vocals, real piano chord setups, and bouncy house drum templates.',
    status: 'Open'
  },
  {
    id: 'label_179',
    name: 'Sound of Amsterdam',
    email: 'demos@soundofamsterdam.nl',
    website: 'https://instagram.com/soundofamsterdam',
    instagram: '@soundofamsterdam',
    genre: 'House',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Amsterdam collective releasing warm room house, cozy vocal tracks, and analog-heavy club grooves.',
    bestFitDescription: 'Warm baseline grooves, smooth Rhodes chords, and cozy 909 acoustic clap tracks.',
    status: 'Open'
  },
  {
    id: 'label_180',
    name: 'Rush Hour Distribution',
    email: 'distro@rushhour.nl',
    website: 'https://rushhour.nl',
    instagram: '@rushhourmusic',
    genre: 'Electronic / Other',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Distro arm of Rush Hour. Seeking raw, motoric Detroit techno, leftfield electro, and deeply unique modular electronics.',
    bestFitDescription: 'Dissonant modular lead arrays, raw hardware warehouse rhythms, and futuristic space sound effects.',
    status: 'Open'
  },
  {
    id: 'label_181',
    name: 'Shelter resident showcase (Artist Promo)',
    email: 'shelter.promos@shelteramsterdam.nl',
    website: 'https://shelteramsterdam.nl',
    instagram: '@shelteramsterdam',
    genre: 'Minimal / Deep Tech',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Direct pipeline to early morning residents at Shelter. Looking for dark, deep rolling minimal heaters with extremely rich sub details.',
    bestFitDescription: 'Deep rolling sub baselines, snappy microtonal percussions, and dark warm filter sweeps.',
    status: 'Open'
  },
  {
    id: 'label_182',
    name: 'fabric Records',
    email: 'demos@fabriclondon.com',
    website: 'https://fabriclondon.com',
    instagram: '@fabricrecords',
    genre: 'Minimal / Deep Tech',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'The record division of legendary club fabric London. Prioritizes cutting-edge minimal deep tech, breakbeats, and underground UK garage hooks.',
    bestFitDescription: 'Underground British garage swing, deep heavy basslines, and hypnotic microtonic loops.',
    status: 'Open'
  },
  {
    id: 'label_183',
    name: 'Ritter Butzke (Club Showcase)',
    email: 'promos@ritter-butzke.de',
    website: 'https://club.ritter-butzke.de',
    instagram: '@ritter_butzke',
    genre: 'Melodic House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Acclaimed Berlin creative club workspace. Sourcing bouncy, melodic, warm deep house, and colorful melodic techno weapons.',
    bestFitDescription: 'Bouncy synthetic arpeggios, warm emotional strings, and positive organic percussions.',
    status: 'Open'
  },
  {
    id: 'label_184',
    name: 'Riverside Agency International (Artist Showcase)',
    email: 'agency@riverside-berlin.de',
    website: 'https://instagram.com/riverside_berlin',
    instagram: '@riverside_berlin',
    genre: 'Deep House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Alternative agency organizing dynamic deep house showcases across Germany. Seeking elegant, sophisticated deep house grooves and atmospheric pads.',
    bestFitDescription: 'Atmospheric cozy pads, detailed micro-transients, and warm vintage machine hiss with elegant chords.',
    status: 'Open'
  },
  {
    id: 'label_185',
    name: 'Bootshaus (Club Showcase)',
    email: 'promos@bootshaus.tv',
    website: 'https://bootshaus.tv',
    instagram: '@bootshaus',
    genre: 'Electronic / Other',
    region: 'Cologne, Germany 🇩🇪',
    notes: 'German bass and electronic giant Bootshaus. Resident DJs evaluate massive, peak-time, energetic, dark-themed club and festival destroyers.',
    bestFitDescription: 'Loud aggressive synthesizers, heavy sidechained sub kicks, and fast-paced riser sweeps with huge drops.',
    status: 'Open'
  },
  {
    id: 'label_186',
    name: 'Blind Fold Records',
    email: 'demos@blindfoldrecords.com',
    website: 'https://blindfoldrecords.dk',
    instagram: '@blindfoldrecords',
    genre: 'Minimal / Deep Tech',
    region: 'Copenhagen, Denmark 🇩🇰',
    notes: 'Boutique Scandinavian label focusing on deep rolling textures, microtonal rhythm sequences, and ambient minimalist grooves.',
    bestFitDescription: 'Delicate static layers, snappy sub-groove, cozy room reverb, organic field recording elements.',
    status: 'Open'
  },
  {
    id: 'label_187',
    name: 'Katermukke',
    email: 'demos@katermukke.info',
    website: 'https://katermukke.info',
    instagram: '@katermukke',
    genre: 'Deep House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Playful Berlin imprint associated with Kater Blau club. Sourcing eccentric deep-house, warm organic melodies, and deep-tech elements.',
    bestFitDescription: 'Wobbly bass sound, energetic hi-hats, subtle electronic vocals, and quirky synthesizer themes.',
    status: 'Open'
  },
  {
    id: 'label_188',
    name: 'Do Not Sleep',
    email: 'demos@donotsleepibiza.com',
    website: 'https://donotsleepibiza.com',
    instagram: '@donotsleepibiza',
    genre: 'Tech House',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Ibiza-born underground dance event series and imprint. Sourcing dirty rolling tech-house, sharp 909 beats, and raw vocal loops.',
    bestFitDescription: 'Loud punchy claps, classic MPC-swung tech drums, highly repetitive catchy speak samples.',
    status: 'Open'
  },
  {
    id: 'label_189',
    name: 'MoBlack Records',
    email: 'demos@moblack.com',
    website: 'https://moblackrecords.com',
    instagram: '@moblackrecords',
    genre: 'Afro House',
    region: 'Milan, Italy 🇮🇹',
    notes: 'Mainstay tastemaker Afro House imprint. Driven by African chanting vocals, heavy hand-drums, and lush melodic synth arrangements.',
    bestFitDescription: 'Deep acoustic congas, traditional vocal performance loops, warm organic synth arps.',
    status: 'Open'
  },
  {
    id: 'label_190',
    name: 'Mule Musiq',
    email: 'mulemusiq@mulemusiq.com',
    website: 'https://mulemusiq.com',
    instagram: '@mulemusiq',
    genre: 'Deep House',
    region: 'Tokyo, Japan 🇯🇵',
    notes: 'Tokyo-based minimal deep house and ambient label. Values highly artistic soundscapes, vintage warming chords, and tape-hiss grooves.',
    bestFitDescription: 'Extremely cozy classic chords, acoustic brush snare sweeps, dusty record crackle, deep melancholic bass leads.',
    status: 'Open'
  },
  {
    id: 'label_191',
    name: 'Sondela Recordings',
    email: 'submissions@sondela.dance',
    website: 'https://sondela.dance',
    instagram: '@sondelarecordings',
    genre: 'Afro House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Sister imprint to Defected focused on Afro Tech and Afro Deep styles. Looking for heavy, tribal electronic crossovers with driving bass.',
    bestFitDescription: 'Heavy sidechained club sub-weight, rich syncopated drums, and soulful chants or clean vocal riffs.',
    status: 'Open'
  },
  {
    id: 'label_192',
    name: 'Elysium Collective',
    email: 'demos@elysiummusic.gr',
    website: 'https://elysiummusic.gr',
    instagram: '@elysium_collective',
    genre: 'Melodic House',
    region: 'Athens, Greece 🇬🇷',
    notes: 'Emerging Mediterranean melodic label. Looking for uplifting celestial progressions, ethereal warm pads, and progressive house structures.',
    bestFitDescription: 'Glistening pluck leads, driving modular synth arrays, positive high-energy sweeps, spiritual soundscapes.',
    status: 'Open'
  },
  {
    id: 'label_193',
    name: 'Deeperfect Records',
    email: 'ar@deeperfect.com',
    website: 'https://deeperfect.com',
    instagram: '@deeperfect',
    genre: 'Minimal / Deep Tech',
    region: 'Florence, Italy 🇮🇹',
    notes: 'Stefano Noferini’s solid minimal-tech blueprint. Seeks snappy rolling percussion loops, dry sound setups, and highly syncopated basslines.',
    bestFitDescription: 'Snappy dry rimshot fills, wooden percussive textures, heavy dynamic micro-sublines.',
    status: 'Open'
  },
  {
    id: 'label_194',
    name: 'CACAO Records',
    email: 'demos@cacaorecordings.com',
    website: 'https://cacaorecordings.com',
    instagram: '@cacaorecords',
    genre: 'Afro House',
    region: 'San José, Costa Rica 🇨🇷',
    notes: 'Central American deep organic label. Blending electronic rhythms with rainforest sound textures and classic Latin jazz elements.',
    bestFitDescription: 'Shaker progressions, organic ambient nature sounds, live woodwinds, and deep house baseline hum.',
    status: 'Open'
  },
  {
    id: 'label_195',
    name: 'Kitsuné Musique',
    email: 'demos@kitsunemusique.com',
    website: 'https://maisonkitsune.com',
    instagram: '@kitsunemusique',
    genre: 'Disco House',
    region: 'Paris, France 🇫🇷',
    notes: 'Parisian fashion/music label. Seeking highly infectious indie dance, bright colorful disco chords, and retro French house templates.',
    bestFitDescription: 'French touch filter-sweep loops, lively bass guitars, positive retro synth-stabs.',
    status: 'Open'
  },
  {
    id: 'label_196',
    name: 'No Art',
    email: 'submissions@noartmusic.com',
    website: 'https://noartmusic.com',
    instagram: '@noartmusic',
    genre: 'Minimal / Deep Tech',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Founded by ANOTR. Looking for highly energetic, jazz-influenced, organic minimal-deep beats with unique horn and vocal samples.',
    bestFitDescription: 'Thick dynamic swing, swinging live jazz snare cuts, organic brass drops, highly infectious micro-rhythms.',
    status: 'Open'
  },
  {
    id: 'label_197',
    name: 'Shall Not Fade',
    email: 'demos@shallnotfade.co.uk',
    website: 'https://shallnotfade.co.uk',
    instagram: '@shallnotfade',
    genre: 'House',
    region: 'Bristol, United Kingdom 🇬🇧',
    notes: 'Underground visual vinyl label. Prioritizes raw analog recordings, gritty vintage hardware feel, lo-fi house textures, and deep UK garage swings.',
    bestFitDescription: 'Tape-saturated 909 kicks, warm MPC swing, hazy chords, dusty analog hum.',
    status: 'Open'
  },
  {
    id: 'label_198',
    name: 'Lobster Theremin',
    email: 'promos@lobstertheremin.com',
    website: 'https://lobstertheremin.com',
    instagram: '@lobstertheremin',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Legendary gritty outlet. Searing hardware raw house, distortion-rich electronic vibes, modular techno, and acid house.',
    bestFitDescription: 'Screaming 303 bass acid loops, heavily saturated snare hits, dirty vintage tape hiss.',
    status: 'Open'
  },
  {
    id: 'label_199',
    name: 'Robsoul Recordings',
    email: 'demos@robsoulrecordings.com',
    website: 'https://robsoulrecordings.com',
    instagram: '@robsoulrecordings',
    genre: 'House',
    region: 'Paris, France 🇫🇷',
    notes: 'Phil Weeks’ premium Chicago-house inspired imprint. Sourcing heavily swung, vinyl-sampled grooves with extremely groovy bass riffs.',
    bestFitDescription: 'Funky bass guitar loops, heavily swung MPC drum template, catchy old school vocal stabs.',
    status: 'Open'
  },
  {
    id: 'label_200',
    name: 'Toy Tonics',
    email: 'demos@toytonics.de',
    website: 'https://toytonics.de',
    instagram: '@toytonics',
    genre: 'Disco House',
    region: 'Munich, Germany 🇩🇪',
    notes: 'Elite Nu-Disco and funk-infused label. Sourcing highly playful vintage dancefloor gems with live acoustic percussion and electric basslines.',
    bestFitDescription: 'Upbeat funky guitar riffs, infectious acoustic cowbells, disco diva vocal overlays.',
    status: 'Open'
  },
  {
    id: 'label_201',
    name: 'Heist Recordings',
    email: 'demos@heistrecordings.com',
    website: 'https://heistrecordings.com',
    instagram: '@heistrecordings',
    genre: 'Deep House',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Run by Dam Swindle. Prioritizes high-end sampling, modern organic grooves, jazzy chord structures, and MPC-inspired warmth.',
    bestFitDescription: 'Warm Rhodes vintage keys, swinging natural drum performance, soulful jazz horn edits.',
    status: 'Open'
  },
  {
    id: 'label_202',
    name: 'Local Talk',
    email: 'demos@localtalk.se',
    website: 'https://localtalk.se',
    instagram: '@localtalkrecords',
    genre: 'House',
    region: 'Stockholm, Sweden 🇸🇪',
    notes: 'Classic house aesthetic outlet. Looking for raw garage grooves, positive Rhodes stabs, and energetic 4x4 rhythmic foundations.',
    bestFitDescription: 'Authentic organ patches, bouncy analog basslines, energetic shaker layers.',
    status: 'Open'
  },
  {
    id: 'label_203',
    name: "Gents & Dandy's",
    email: 'promos@gentsndandys.com',
    website: 'https://gentsndandys.com',
    instagram: '@gents_nd_andys',
    genre: 'Deep House',
    region: 'Bruges, Belgium 🇧🇪',
    notes: 'Underground boutique deep house label. Focuses on warm sub-basses, smoky midnight club atmosphere, and elegant late-night dub chords.',
    bestFitDescription: 'Echoing dub delay stabs, deep sub bass weight, lazy swinging hi-hat patterns.',
    status: 'Open'
  },
  {
    id: 'label_204',
    name: 'SlothBoogie',
    email: 'demos@slothboogie.com',
    website: 'https://slothboogie.com',
    instagram: '@slothboogie',
    genre: 'Disco House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Tastemaker editorial channel and record label. Looks for slow-burning groovy edits, funky disco loop chops, and soulful house elements.',
    bestFitDescription: 'Slow organic groove (118-122bpm), vintage funk riffs, warm background acoustic noise.',
    status: 'Open'
  },
  {
    id: 'label_205',
    name: 'Sulk Magic',
    email: 'demos@sulkmagic.com.au',
    website: 'https://sulkmagic.com',
    instagram: '@sulkmagic',
    genre: 'Minimal / Deep Tech',
    region: 'Melbourne, Australia 🇦🇺',
    notes: 'Boutique Melbourne minimal community collective. Sourcing stripped back, spacey clicks, rich sub-bass, and mechanical micro-movements.',
    bestFitDescription: 'Rhythmic glitches, very deep sub-frequency hum, minimal visual delays.',
    status: 'Open'
  },
  {
    id: 'label_206',
    name: 'Mellow Groove Records',
    email: 'submissions@mellowgroove.com',
    website: 'https://mellowgrooverecords.com',
    instagram: '@mellowgrooverec',
    genre: 'House',
    region: 'Austin, Texas 🇺🇸',
    notes: 'Boutique Texas label seeking warm, jazzy deep house, classic garage kicks, and smooth emotional chord progressions.',
    bestFitDescription: 'Jazzy piano loops, classic 909 rimshots, warm double bass hooks.',
    status: 'Open'
  },
  {
    id: 'label_207',
    name: 'Coastal Recordings',
    email: 'demos@coastal-recs.com',
    website: 'https://coastalrecordings.com',
    instagram: '@coastalrecordings',
    genre: 'Deep House',
    region: 'Miami, Florida 🇺🇸',
    notes: 'East Coast boutique agency. Sourcing beach-ready organic deep house, breezy steel drum textures, and sunset vocal clips.',
    bestFitDescription: 'Breezy acoustic percussion, soft modular swells, smooth female vocal echoes.',
    status: 'Open'
  },
  {
    id: 'label_208',
    name: 'Rhythm Section International',
    email: 'demos@rhythmsection.co',
    website: 'https://rhythmsection.co',
    instagram: '@rhythmsectioninternational',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Bradley Zero’s exceptional tastemaker label. Seeking global rhythm infusions, broken beats, live jazz elements, and genre-bending dance vibes.',
    bestFitDescription: 'Broken beat rhythms, organic acoustic hand-claps, fusion jazz solos, warm analog textures.',
    status: 'Open'
  },
  {
    id: 'label_209',
    name: 'Dusty Records',
    email: 'demos@dustydetroit.com',
    website: 'https://dustydetroit.com',
    instagram: '@dusty_detroit',
    genre: 'House',
    region: 'Detroit, Michigan 🇺🇸',
    notes: 'Detroit local label focused on preserving raw hardware mid-western house roots, messy vintage drum structures, and vintage brass riffs.',
    bestFitDescription: 'Dirty MPC drum machine tracks, vintage synthesizer hum, energetic raw classic house structure.',
    status: 'Open'
  },
  {
    id: 'label_210',
    name: 'Piston Recordings',
    email: 'demos@pistonrecordings.com',
    website: 'https://pistonrecordings.com',
    instagram: '@pistonrecordings',
    genre: 'Deep House',
    region: 'Lisbon, Portugal 🇵🇹',
    notes: 'Established Portuguese house pioneer. Demands classy deep-house blueprints, modular chord pads, and rhythmic shaker setups.',
    bestFitDescription: 'Warm modular synth loops, classic 909 open hats, smooth late night bassline drive.',
    status: 'Open'
  },
  {
    id: 'label_211',
    name: 'Subtrak',
    email: 'demos@subtrak-ba.com',
    website: 'https://subtrakba.com',
    instagram: '@subtrak_music',
    genre: 'Minimal / Deep Tech',
    region: 'Buenos Aires, Argentina 🇦🇷',
    notes: 'Underground Buenos Aires minimal hub. Sourcing dark mechanical ticks, deep warm sweeps, and snappy structural club grooves.',
    bestFitDescription: 'Subtle metallic clicks, deep rolling sub lines, and hypnotic modular sweeps.',
    status: 'Open'
  },
  {
    id: 'label_212',
    name: 'Atelje Rec',
    email: 'demos@atelješweden.se',
    website: 'https://ateljesweden.se',
    instagram: '@ateljesweden',
    genre: 'Melodic House',
    region: 'Stockholm, Sweden 🇸🇪',
    notes: 'Scandi high-concept melodic design label. Looking for slow-burning, nostalgic Nordic modular arpeggios and deep winter soundscapes.',
    bestFitDescription: 'Nostalgic modular pluck lines, cold digital pad sweeps, slow heavy organic kick loops.',
    status: 'Open'
  },
  {
    id: 'label_213',
    name: 'Roots & Dubs',
    email: 'demos@rootsanddubs.co.za',
    website: 'https://rootsanddubs.co.za',
    instagram: '@rootsanddubssouthafrica',
    genre: 'Afro House',
    region: 'Johannesburg, South Africa 🇿🇦',
    notes: 'Johannesburg underground stable. Seeking raw vintage deep afro grooves, highly structural percussion, and traditional African baseline rhythms.',
    bestFitDescription: 'Traditional vocal accents, highly syncopated woodblock rhythms, deep bassline structures.',
    status: 'Open'
  },
  {
    id: 'label_214',
    name: 'Kookoo Records',
    email: 'demos@kookooibiza.com',
    website: 'https://kookooibiza.com',
    instagram: '@kookoo_ibiza',
    genre: 'Tech House',
    region: 'Ibiza, Spain 🇪🇸',
    notes: 'Quirky Balearic boutique label. Looking for bright melodic hook-lines, energetic tech-house frames, and warm summery visual backgrounds.',
    bestFitDescription: 'Summery minor chords, snappy tech house drums, playful voice bits.',
    status: 'Open'
  },
  {
    id: 'label_215',
    name: 'Out Of Mind',
    email: 'demos@outofmindrome.it',
    website: 'https://outofmindrome.it',
    instagram: '@outofmind_rome',
    genre: 'Minimal / Deep Tech',
    region: 'Rome, Italy 🇮🇹',
    notes: 'Underground Italian showcase series. Looking for highly physical drum elements, subtle delayed micro-notes, and dark moody synth waves.',
    bestFitDescription: 'High contrast sub bass lines, echoing wood blocks, dry minimal drum design.',
    status: 'Open'
  },
  {
    id: 'label_216',
    name: 'Yaza Collective',
    email: 'demos@yazacollective.es',
    website: 'https://yazacollective.es',
    instagram: '@yazacollective',
    genre: 'Afro House',
    region: 'Madrid, Spain 🇪🇸',
    notes: 'Boutique Spanish Afro House community. Sourcing deep tribal elements, organic Spanish acoustic guitars, and spiritual vocal sweeps.',
    bestFitDescription: 'Acoustic guitar loops, organic shaker lines, spiritual chanting vocal beds.',
    status: 'Open'
  },
  {
    id: 'label_217',
    name: 'Paper Recordings',
    email: 'demos@paperecordings.co.uk',
    website: 'https://paperecordings.com',
    instagram: '@paperecordings',
    genre: 'Disco House',
    region: 'Manchester, United Kingdom 🇬🇧',
    notes: 'Historical Northern Nu-Disco and Balearic house stable. Seeking colorful synths, retro drum machine grooves, and funky retro bass lines.',
    bestFitDescription: 'Funky retro bass synths, upbeat warm electronic cowbells, classic disco hi-hat grids.',
    status: 'Open'
  },
  {
    id: 'label_218',
    name: 'Krypton',
    email: 'demos@kryptoncologne.de',
    website: 'https://instagram.com/krypton_cologne',
    instagram: '@krypton_cologne',
    genre: 'Electronic / Other',
    region: 'Cologne, Germany 🇩🇪',
    notes: 'Underground Cologne synth and techno label. Deep driving dark analog arps, heavy sound design details, and moody modular progressions.',
    bestFitDescription: 'Screaming synthesizer leads, modular pulse wave patterns, heavy fast-paced kicks.',
    status: 'Open'
  },
  {
    id: 'label_219',
    name: 'Lost & Found',
    email: 'demos@lostandfoundrec.com',
    website: 'https://lostandfoundrec.com',
    instagram: '@lostandfoundrec',
    genre: 'Melodic House',
    region: 'Tel Aviv, Israel 🇮🇱',
    notes: 'Guy J’s premier melodic and progressive brand. Sourcing deep emotional developments, sweeping pads, and high-fidelity melodic arrangements.',
    bestFitDescription: 'Cinematic pads, beautiful progressive arps, smooth organic transitions.',
    status: 'Open'
  },
  {
    id: 'label_220',
    name: 'Bedrock Records',
    email: 'demos@bedrock.org.uk',
    website: 'https://bedrock.org.uk',
    instagram: '@bedrockrecords',
    genre: 'Melodic House',
    region: 'Brighton, United Kingdom 🇬🇧',
    notes: 'John Digweed’s legendary electronic imprint. Seeking high-fidelity dark electronic progressions, moody melodic techno, and deep mental vibes.',
    bestFitDescription: 'Pulsing synth grids, dark industrial delays, solid analog heavy sub bass.',
    status: 'Open'
  },
  {
    id: 'label_221',
    name: 'Systematic Recordings',
    email: 'demos@systematic-recordings.com',
    website: 'https://systematic-recordings.com',
    instagram: '@systematic_recordings',
    genre: 'Melodic House',
    region: 'Hamburg, Germany 🇩🇪',
    notes: 'Marc Romboy’s premium hardware-focused imprint. Demands authentic analog synth recordings, classic modular triggers, and dark sweeping transitions.',
    bestFitDescription: 'Authentic Roland Juno chords, heavy analog synth plucks, driving tech-infused drums.',
    status: 'Open'
  },
  {
    id: 'label_222',
    name: 'Watergate Records',
    email: 'demos@watergate-club.de',
    website: 'https://watergate-club.de',
    instagram: '@watergate.club.official',
    genre: 'Melodic House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Born from Watergate Club by the river Spree. Sourcing highly polished, club-tested deep and melodic house weapons with bright neon-lights vibes.',
    bestFitDescription: 'Neon pluck synth hooks, energetic 4x4 drum machine loops, smooth dramatic sweeps.',
    status: 'Open'
  },
  {
    id: 'label_223',
    name: 'Get Physical Music',
    email: 'demos@physical-music.de',
    website: 'https://getphysicalmusic.com',
    instagram: '@getphysicalmusic',
    genre: 'Tech House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'M.A.N.D.Y. and Booka Shade’s legacy boutique brand. Sourcing deep organic house, clever minimalist tech, and quirky vocal transitions.',
    bestFitDescription: 'Dry electronic micro-percussions, quirky talk box vocal leads, warm physical baseline.',
    status: 'Open'
  },
  {
    id: 'label_224',
    name: 'Exploited Rec',
    email: 'demos@exploited-rec.de',
    website: 'https://exploited-records.de',
    instagram: '@exploitedrec',
    genre: 'House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Shir Khan’s tastemaker label. Focuses on deep, disco-infused, soulful house with indie dance flair and highly memorable vocal hooks.',
    bestFitDescription: 'Memorable soulful vocal hooks, funky bassline cuts, bright playful organ structures.',
    status: 'Open'
  },
  {
    id: 'label_225',
    name: 'Suara',
    email: 'demos@suaramusic.com',
    website: 'https://suaramusic.com',
    instagram: '@suaramusic',
    genre: 'Tech House',
    region: 'Barcelona, Spain 🇪🇸',
    notes: 'Coyu’s kitty-themed imprint. Sucking up energetic raw techno, punchy fast tech-house, and acid synth variations.',
    bestFitDescription: 'Acid 303 loops, thick compression kick beats, energetic high-sharks.',
    status: 'Open'
  },
  {
    id: 'label_226',
    name: 'Stil vor Talent',
    email: 'demos@stilvortalent.de',
    website: 'https://stilvortalent.de',
    instagram: '@stilvortalent',
    genre: 'Melodic House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Oliver Koletzki’s massive electronic hub. Seeking organic melodic techno, cinematic vocal journeys, and energetic world percussion layouts.',
    bestFitDescription: 'Uplifting modular string leads, organic world instrumentation, heavy club-ready bass weight.',
    status: 'Open'
  },
  {
    id: 'label_227',
    name: 'Sincopat',
    email: 'demos@sincopat.com',
    website: 'https://sincopat.com',
    instagram: '@sincopat',
    genre: 'Melodic House',
    region: 'Valencia, Spain 🇪🇸',
    notes: 'Spanish melodic indie label. Values quirky unexpected melodic hooks, retro synthwave aesthetics, and energetic underground beats.',
    bestFitDescription: 'Retro game synthesizer plucks, unpredictable pitch bends, warm house chords.',
    status: 'Open'
  },
  {
    id: 'label_228',
    name: 'Culprit',
    email: 'demos@culpritla.com',
    website: 'https://instagram.com/culprit_la',
    instagram: '@culprit_la',
    genre: 'Deep House',
    region: 'Los Angeles, United States 🇺🇸',
    notes: 'LA rooftop brand focused on sun-drenched, melancholic, West-Coast deep house and elegant melodic lines.',
    bestFitDescription: 'Warm organic guitar plucks, melancholic deep strings, breezy drum machine grooves.',
    status: 'Open'
  },
  {
    id: 'label_229',
    name: 'Visionquest',
    email: 'demos@visionquestrec.com',
    website: 'https://visionquestrec.com',
    instagram: '@visionquest_music',
    genre: 'Minimal / Deep Tech',
    region: 'Detroit, United States 🇺🇸',
    notes: 'Seth Troxler and Ryan Crosson’s artistic platform. Sourcing highly psychedelic, abstract minimal grooves and trippy deep house.',
    bestFitDescription: 'Abstract vocal stutter loops, spacey organic delays, driving groovy sub-bass.',
    status: 'Open'
  },
  {
    id: 'label_230',
    name: 'Ghostly International',
    email: 'demos@ghostly.com',
    website: 'https://ghostly.com',
    instagram: '@ghostly',
    genre: 'Electronic / Other',
    region: 'Brooklyn, United States 🇺🇸',
    notes: 'Art and tech powerhouse label. Seeking cinematic ambient pieces, glitchy electronica, and modular leftfield house.',
    bestFitDescription: 'Cinematic texturized delays, glitchy click loops, organic ambient field sweeps.',
    status: 'Open'
  },
  {
    id: 'label_231',
    name: 'Kompakt',
    email: 'demos@kompakt.fm',
    website: 'https://kompakt.fm',
    instagram: '@kompakt_cologne',
    genre: 'Melodic House',
    region: 'Cologne, Germany 🇩🇪',
    notes: 'The absolute standard for German minimal techno and ambient. Sourcing dreamy, micro-melodic sequences and driving warm kicks.',
    bestFitDescription: 'Dreamy delayed pluck sequences, warm round kick drums, nostalgic modular backgrounds.',
    status: 'Open'
  },
  {
    id: 'label_232',
    name: 'Dial Records',
    email: 'demos@dial-rec.com',
    website: 'https://dial-rec.com',
    instagram: '@dial_records',
    genre: 'Deep House',
    region: 'Hamburg, Germany 🇩🇪',
    notes: 'Art-house minimal deep label. Focuses on extremely sparse recordings, melancholic ambient pads, and beautiful microtonal sounds.',
    bestFitDescription: 'Extremely quiet background rain hum, sparse acoustic keys, soft warm baseline.',
    status: 'Open'
  },
  {
    id: 'label_233',
    name: 'Smallville Records',
    email: 'demos@smallville-records.com',
    website: 'https://smallville-records.com',
    instagram: '@smallville_records',
    genre: 'Deep House',
    region: 'Hamburg, Germany 🇩🇪',
    notes: 'Beloved vinyl-focused deep house brand. Sourcing dusty warming chords, organic handclaps, and deep analog hardware basslines.',
    bestFitDescription: 'Dusty vinyl background noise, warm organic handclap fills, classic raw baseline.',
    status: 'Open'
  },
  {
    id: 'label_234',
    name: 'Giegling',
    email: 'demos@giegling.net',
    website: 'https://giegling.net',
    instagram: '@giegling_net',
    genre: 'Minimal / Deep Tech',
    region: 'Weimar, Germany 🇩🇪',
    notes: 'Highly elusive avant-garde collective. Demands unique artistic textures, dusty live jazz piano cuts, and gorgeous melancholic dub-tech loops.',
    bestFitDescription: 'Delicate organic vinyl crackle, melancholic piano sweeps, deep subtle sub-lines.',
    status: 'Open'
  },
  {
    id: 'label_235',
    name: 'Perlon',
    email: 'demos@perlon-records.de',
    website: 'https://instagram.com/perlon_records',
    instagram: '@perlon_records',
    genre: 'Minimal / Deep Tech',
    region: 'Frankfurt, Germany 🇩🇪',
    notes: 'Zip and Markus Nikolai’s holy grail of minimal vinyl. Sourcing quirky, swingy mechanical micro-house, modular bleeps, and zero digital clutter.',
    bestFitDescription: 'Dry wooden rims, playful modular bleeps, heavy swinging sub-grooves.',
    status: 'Open'
  },
  {
    id: 'label_236',
    name: 'Cabaret Recordings',
    email: 'demos@cabaret-rec.jp',
    website: 'https://cabaretrecordings.jp',
    instagram: '@cabaret_recordings',
    genre: 'Minimal / Deep Tech',
    region: 'Tokyo, Japan 🇯🇵',
    notes: 'Japanese vinyl boutique label. Sourcing precise structural digital-minimal rhythm loops, spacey SF-effects, and snappy bass-pulses.',
    bestFitDescription: 'Spacey sound effects, digital synth-pops, snappy rolling baseline patterns.',
    status: 'Open'
  },
  {
    id: 'label_237',
    name: 'Pressure Traxx',
    email: 'demos@pressure-traxx.de',
    website: 'https://pressure-traxx.de',
    instagram: '@pressuretraxx',
    genre: 'Minimal / Deep Tech',
    region: 'Frankfurt, Germany 🇩🇪',
    notes: 'Frankfurt peak club minimal brand. Looking for physical dynamic micro-percussion, repetitive spoken loops, and raw industrial vibes.',
    bestFitDescription: 'Raw industrial steel hit echoes, repetitive modular sweeps, high contrast kicks.',
    status: 'Open'
  },
  {
    id: 'label_238',
    name: 'Apollonia',
    email: 'demos@apollonia.fr',
    website: 'https://apolloniamusic.com',
    instagram: '@apolloniamusic',
    genre: 'Minimal / Deep Tech',
    region: 'Paris, France 🇫🇷',
    notes: 'French trio’s groovy tech house and minimal platform. Demands dusty 90s-inspired French touch drum beats and highly infective baseline grooves.',
    bestFitDescription: 'Infectious bouncy groove, dusty 90s open hats, smooth classic vocal shots.',
    status: 'Open'
  },
  {
    id: 'label_239',
    name: 'Concrete Music',
    email: 'demos@concrete-music.fr',
    website: 'https://concrete-music.fr',
    instagram: '@concreteparis',
    genre: 'Minimal / Deep Tech',
    region: 'Paris, France 🇫🇷',
    notes: 'Born from Paris river party scene. Seeking energetic minimal tech groovers, deep moody synth plucks, and snappy mechanical percussion cuts.',
    bestFitDescription: 'Moody filter-sweepers, snappy mechanical percussive grids, energetic subbass weight.',
    status: 'Open'
  },
  {
    id: 'label_240',
    name: 'yoyaku',
    email: 'demos@yoyaku.io',
    website: 'https://yoyaku.io',
    instagram: '@yoyakuparis',
    genre: 'Minimal / Deep Tech',
    region: 'Paris, France 🇫🇷',
    notes: 'Elite record store, distributor, and label group. Prioritizes French minimal aesthetic, microtonal synth sequences, and extremely detailed basslines.',
    bestFitDescription: 'Microtonal digital sequence blips, incredibly warm basslines, snappy snare rolls.',
    status: 'Open'
  },
  {
    id: 'label_241',
    name: 'Subconscious',
    email: 'demos@subconscious-chicago.com',
    website: 'https://instagram.com/subconscious_chicago',
    instagram: '@subconscious_chicago',
    genre: 'Tech House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Midwest premium underground tech label. Sourcing driving warehouse tech house, raw 909 jack, and classic dark acid bass loops.',
    bestFitDescription: 'Screaming acid synthesizer lines, raw hardware drum performance, heavy punchy sub drops.',
    status: 'Open'
  },
  {
    id: 'label_242',
    name: 'Nervous Records',
    email: 'demos@nervousnyc.com',
    website: 'https://nervousnyc.com',
    instagram: '@nervousrecords',
    genre: 'House',
    region: 'New York, United States 🇺🇸',
    notes: 'Legacy NYC club staple. Demands absolute classic house energy, dirty swinging groove layouts, soul-wrenching vocal stems, and heavy bass.',
    bestFitDescription: 'Soulful diva vocals, rolling dirty sub-grooves, classic NY garage swing.',
    status: 'Open'
  },
  {
    id: 'label_243',
    name: 'Strictly Rhythm',
    email: 'demos@strictlynyc.com',
    website: 'https://strictlyrhythm.com',
    instagram: '@strictlyrhythm',
    genre: 'House',
    region: 'New York, United States 🇺🇸',
    notes: 'The foundation of modern dance music. Seeks punchy, high-energy, classic house stabs, vocal performance samples, and bouncy standard basslines.',
    bestFitDescription: 'Uplifting classic organ stabs, energetic driving 4x4 hats, bouncy vocal hooks.',
    status: 'Open'
  },
  {
    id: 'label_244',
    name: 'King Street Sounds',
    email: 'demos@kingstreetsounds.com',
    website: 'https://kingstreetsounds.com',
    instagram: '@kingstreetsounds',
    genre: 'House',
    region: 'New York, United States 🇺🇸',
    notes: 'Legendary soulful garage label. Looking for gospel-inspired vocals, deep rhodes chords, and organic acoustic hand-percussions.',
    bestFitDescription: 'Gospel deep vocals, warm cozy rhodes keys, organic conga and bongo rhythms.',
    status: 'Open'
  },
  {
    id: 'label_245',
    name: 'Large Music',
    email: 'demos@largemusic.com',
    website: 'https://largemusic.com',
    instagram: '@largemusic',
    genre: 'Deep House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Chicago deep house mainstay. Sourcing classy, warm, jazz-tinged vocal cuts, smooth active baseline patterns, and clean digital keys.',
    bestFitDescription: 'Smooth active baseline loops, classy jazz sax cuts, clean electric organ stabs.',
    status: 'Open'
  },
  {
    id: 'label_246',
    name: 'Guidance Recordings',
    email: 'demos@guidancerec.com',
    website: 'https://instagram.com/guidancerecordings',
    instagram: '@guidancerecordings',
    genre: 'Deep House',
    region: 'Chicago, United States 🇺🇸',
    notes: 'Eclectic deep house and dub-fusion collective. Seek atmospheric sound landscapes, organic wind instruments, and deep dub bass elements.',
    bestFitDescription: 'Warm dub-delay riffs, slow organic woodwind hooks, deep moody sub lines.',
    status: 'Open'
  },
  {
    id: 'label_247',
    name: 'Wiggle Records',
    email: 'promos@wiggledance.co.uk',
    website: 'https://instagram.com/wiggle_records',
    instagram: '@wiggle_records',
    genre: 'Tech House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Terry Francis’ pioneer tech house label. Sourcing deep dubby acid-tech rolls, dark UK underground aesthetics, and highly trippy sound effects.',
    bestFitDescription: 'Dubby tech house delays, spacey background echo, trippy acid-pulses.',
    status: 'Open'
  },
  {
    id: 'label_248',
    name: 'Swag Records',
    email: 'promos@swagrecords.co.uk',
    website: 'https://swagrecords.com',
    instagram: '@swag_records_london',
    genre: 'Minimal / Deep Tech',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Historical London vinyl-stable. Sourcing gritty minimal tech-beats, raw analog loops, and UK garage house influenced bass grooves.',
    bestFitDescription: 'Gritty raw garage rhythm cuts, bouncy hardware bass grooves, classic analog noise.',
    status: 'Open'
  },
  {
    id: 'label_249',
    name: 'Freerange Records',
    email: 'demos@freerangerecords.co.uk',
    website: 'https://freerangerecords.co.uk',
    instagram: '@freerangerecords',
    genre: 'Deep House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Jimpster’s premium deep house label. Sourcing sophisticated jazz-infused arrangements, gorgeous organic synths, and classic drum machine patterns.',
    bestFitDescription: 'Sophisticated jazz rhodes patterns, organic modular baseline drops, smooth dynamic transitions.',
    status: 'Open'
  },
  {
    id: 'label_250',
    name: "Buzzin' Fly Records",
    email: 'demos@buzzinfly.co.uk',
    website: 'https://buzzinfly.com',
    instagram: '@buzzinflyrecords',
    genre: 'Deep House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Ben Watt’s legendary melodic deep label. Sourcing moody emotional deep house with indie vocal influences and acoustic instrumentation.',
    bestFitDescription: 'Acoustic background guitar washes, moody indie-house vocal cuts, gentle warm drums.',
    status: 'Open'
  },
  {
    id: 'label_251',
    name: 'Simple Records',
    email: 'demos@simplerecords.co.uk',
    website: 'https://simplerecords.co.uk',
    instagram: '@simplerecords',
    genre: 'Deep House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Will Saul’s early imprint. Focusing on melodic-tech crossovers, sophisticated bass patterns, and detailed mechanical glitch details.',
    bestFitDescription: 'Sophisticated smooth synth wave plucks, glitchy hi-hat details, soft deep baseline weight.',
    status: 'Open'
  },
  {
    id: 'label_252',
    name: 'Aus Music',
    email: 'demos@ausmusic.co.uk',
    website: 'https://ausmusic.co.uk',
    instagram: '@ausmusic',
    genre: 'House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Forward-thinking British house label. Focuses on broken beat garage, deep underground vibes, and eccentric melodic synthesizer patterns.',
    bestFitDescription: 'Broken swing UK garage drum patterns, unexpected melodic patterns, heavy sidechained subbass.',
    status: 'Open'
  },
  {
    id: 'label_253',
    name: 'Phonica Records',
    email: 'promos@phonicarecords.co.uk',
    website: 'https://phonicarecords.com',
    instagram: '@phonicarecords',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Legendary Soho vinyl shop label. Sourcing alternative underground house, moody minimal structures, and forward-thinking ambient house patches.',
    bestFitDescription: 'Alternative modular synth patches, room-ambient noise grids, energetic sparse patterns.',
    status: 'Open'
  },
  {
    id: 'label_254',
    name: 'Hypercolour',
    email: 'demos@hypercolour.co.uk',
    website: 'https://hypercolour.co.uk',
    instagram: '@hypercolour',
    genre: 'Tech House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Forward UK label blending deep bass structures, industrial analog tech, and dirty Detroit sci-fi synthesizer sounds.',
    bestFitDescription: 'Gritty detuned analog synth hooks, deep industrial delay loops, rolling club kicks.',
    status: 'Open'
  },
  {
    id: 'label_255',
    name: 'Clone Records',
    email: 'demos@clone.nl',
    website: 'https://clone.nl',
    instagram: '@clonerecords',
    genre: 'Electronic / Other',
    region: 'Rotterdam, Netherlands 🇳🇱',
    notes: 'World-renowned electro and modular-techno stable. Demands sharp robotic electro rhythms, sci-fi modular sweeps, and severe 808 baselines.',
    bestFitDescription: 'Robotic 808 electro layouts, sci-fi spacecraft synthesizers, raw dynamic sweeps.',
    status: 'Open'
  },
  {
    id: 'label_256',
    name: 'Delsin Records',
    email: 'demos@delsin.nl',
    website: 'https://delsinrecords.com',
    instagram: '@delsinrecords',
    genre: 'Electronic / Other',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'The center of Dutch ambient and deep techno. Demands beautiful tape-saturated modular echo loops, deep pad progressions, and cozy beats.',
    bestFitDescription: 'Stunning organic delayed chords, beautiful deep tape-echo loops, warm cozy drum weight.',
    status: 'Open'
  },
  {
    id: 'label_257',
    name: 'Dekmantel',
    email: 'demos@dekmantel.com',
    website: 'https://dekmantel.com',
    instagram: '@dkmntl',
    genre: 'Electronic / Other',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Tastemaker festival and boutique label. Seeking dynamic broken beats, live-styled synthesizers, quirky world drum loops, and retro acid house.',
    bestFitDescription: 'Unorthodox rhythm tempos, bright aggressive retro synthesizers, live acoustic-style drum performance.',
    status: 'Open'
  },
  {
    id: 'label_258',
    name: 'Trouw Resident DJ Pool',
    email: 'promos@trouwamsterdam.nl',
    website: 'https://trouwamsterdam.nl',
    instagram: '@trouwamsterdam',
    genre: 'House',
    region: 'Amsterdam, Netherlands 🇳🇱',
    notes: 'Archived collective of legendary Trouw Amsterdam residents. Sourcing moody, deep minimal-house, raw analog-synthesizer chords, and warm room claps.',
    bestFitDescription: 'Nostalgic room house reverbs, analog synthesizer chords, warm vintage claps.',
    status: 'Open'
  },
  {
    id: 'label_259',
    name: 'Running Back',
    email: 'demos@runningbackrecords.com',
    website: 'https://runningbackrecords.com',
    instagram: '@runningbackrecords',
    genre: 'House',
    region: 'Frankfurt, Germany 🇩🇪',
    notes: 'Gerd Janson’s ultimate positive club house stable. Sourcing happy classic piano loops, energetic vintage arpeggiators, and Balearic sunset chords.',
    bestFitDescription: 'Bright positive piano hooks, fast energetic arps, summery house clap layout.',
    status: 'Open'
  },
  {
    id: 'label_260',
    name: 'Ostgut Ton',
    email: 'demos@ostgut.de',
    website: 'https://ostgut.de',
    instagram: '@berghain_ostgut',
    genre: 'Electronic / Other',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'The record division of Berghain. Demands dark-themed peak industrial techno, heavy rolling subwoofer loops, and cold severe sound effects.',
    bestFitDescription: 'Severe industrial snare hits, rolling deep subwoofer-kick tracks, modular sound effects.',
    status: 'Open'
  },
  {
    id: 'label_261',
    name: 'Tresor Records',
    email: 'demos@tresorberlin.com',
    website: 'https://tresorberlin.com',
    instagram: '@tresorberlin',
    genre: 'Electronic / Other',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Legacy German techno institution. Sourcing high-intensity metallic warehouse rhythms, screaming acid loops, and severe analog drums.',
    bestFitDescription: 'Metallic hi-hat rings, screaming TB-303 loop lines, hard heavy saturated kicks.',
    status: 'Open'
  },
  {
    id: 'label_262',
    name: 'BPitch Control',
    email: 'demos@bpitch.de',
    website: 'https://bpitch.de',
    instagram: '@bpitchcontrol',
    genre: 'Tech House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Ellen Allien’s legendary Berlin platform. Sourcing highly energetic acid-stabs, dark tech-house grooves, and eccentric vocoder lines.',
    bestFitDescription: 'Acid synthesizer stabs, robotic feedback vokoder loops, energetic fast-paced drums.',
    status: 'Open'
  },
  {
    id: 'label_263',
    name: 'Mobilee Records',
    email: 'submissions@mobilee-records.de',
    website: 'https://mobilee-records.de',
    instagram: '@mobileerecords',
    genre: 'Tech House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Anja Schneider’s established imprint. Seeking highly elegant minimal-tech grooves, cozy digital keys, and responsive club drums.',
    bestFitDescription: 'Slick responsive drum-grids, cozy late night keyboards, clean minimal baseline loops.',
    status: 'Open'
  },
  {
    id: 'label_264',
    name: 'Highgrade Records',
    email: 'demos@highgrade-records.de',
    website: 'https://highgrade-records.de',
    instagram: '@highgrade_records',
    genre: 'Tech House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Boutique Berlin tech house label. Seek classy organic percussions, deep modular subbass waves, and smooth room reverb overlays.',
    bestFitDescription: 'Warm organic percussions, modular sub-bass, clean minor-seventh chords.',
    status: 'Open'
  },
  {
    id: 'label_265',
    name: 'Poker Flat Recordings',
    email: 'demos@pokerflat-recordings.de',
    website: 'https://pokerflat-recordings.com',
    instagram: '@pokerflat_recordings',
    genre: 'Tech House',
    region: 'Berlin, Germany 🇩🇪',
    notes: "Steve Bug's standard minimal tech-house imprint. Seeks snappy woodblock clicks, dry 909 tech loops, and repetitive bouncy basslines.",
    bestFitDescription: 'Snappy dry woodblocks, bouncy classic baseline, simple vintage hats.',
    status: 'Open'
  },
  {
    id: 'label_266',
    name: 'Cocoon Recordings',
    email: 'demos@cocoon.net',
    website: 'https://cocoon.net',
    instagram: '@cocoon_official',
    genre: 'Tech House',
    region: 'Frankfurt, Germany 🇩🇪',
    notes: 'Sven Väth’s legendary techno and tech house label. Demands massive peak-time festival groove templates and beautiful melodic sweeps.',
    bestFitDescription: 'Massive festival drum configurations, long dramatic modular riser sweeps.',
    status: 'Open'
  },
  {
    id: 'label_267',
    name: 'Gigolo Records',
    email: 'demos@gigolorecords.com',
    website: 'https://gigolorecords.com',
    instagram: '@gigolorecords',
    genre: 'Electronic / Other',
    region: 'Munich, Germany 🇩🇪',
    notes: 'DJ Hell’s classic electro-clash imprint. Seeks high energy 80s bassline riffs, severe mechanical drum layouts, and dark spoken-word vocals.',
    bestFitDescription: '80s raw synthesizer riffs, severe cold snare rhythms, spoken energetic vocal feeds.',
    status: 'Open'
  },
  {
    id: 'label_268',
    name: 'Permanent Vacation',
    email: 'demos@perm-vacation.com',
    website: 'https://permanentvacation.de',
    instagram: '@permanentvacationrecords',
    genre: 'Disco House',
    region: 'Munich, Germany 🇩🇪',
    notes: 'Elite indie disco and positive synthwave label. Looking for bright neon melodies, organic Balearic guitar lines, and colorful drum designs.',
    bestFitDescription: 'Balearic bright guitar chords, positive neon sythesizers, active drum designs.',
    status: 'Open'
  },
  {
    id: 'label_269',
    name: 'Correspondant',
    email: 'demos@correspondantmusic.com',
    website: 'https://correspondantmusic.com',
    instagram: '@correspondant',
    genre: 'Electronic / Other',
    region: 'Paris, France 🇫🇷',
    notes: 'Jennifer Cardini’s dark-disco label. Sourcing slow-pitched indie techno, vintage detuned synthesized sweeps, and punk acoustic hooks.',
    bestFitDescription: 'Slow-pitched detuned synthesizer leads, punk-styled drum layouts, dark atmospheric sweeps.',
    status: 'Open'
  },
  {
    id: 'label_270',
    name: 'Border Community',
    email: 'demos@bordercommunity.com',
    website: 'https://bordercommunity.com',
    instagram: '@bordercommunity',
    genre: 'Melodic House',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'James Holden’s legacy leftfield house brand. Demands chaotic modular micro-arpeggios, organic acoustic noises, and warm fuzzy pads.',
    bestFitDescription: 'Chaotic analog pitch arpeggiators, fuzzy warm ambient pads, loose acoustic percussion loops.',
    status: 'Open'
  },
  {
    id: 'label_271',
    name: 'Mute Records',
    email: 'promos@mute.com',
    website: 'https://mute.com',
    instagram: '@muterecords',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Pioneering alternative synth-pop and modular-electronic brand. Seek highly original song formats and deep textured sound design pieces.',
    bestFitDescription: 'Moody vocal performances, unique complex synthesizer layouts, room acoustic textures.',
    status: 'Open'
  },
  {
    id: 'label_272',
    name: 'Warp Records',
    email: 'demos@warp.net',
    website: 'https://warp.net',
    instagram: '@warprecords',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'The holy grail of IDM and high-art electronica. Seek highly unorthodox rhythm patterns, stunning visual sound elements, and modular compositions.',
    bestFitDescription: 'Unorthodox glitched structures, cosmic tape-echo, high fidelity artistic strings.',
    status: 'Open'
  },
  {
    id: 'label_273',
    name: 'Ninja Tune',
    email: 'demos@ninjatune.net',
    website: 'https://ninjatune.net',
    instagram: '@ninjatune',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Global independent powerhouse label. Seeking deep organic soundscapes, broken-beat jazz rhythms, cinematic vocal features, and warm deep keys.',
    bestFitDescription: 'Cinematic vocal loops, syncopated broken beat percussion, warm live piano chords.',
    status: 'Open'
  },
  {
    id: 'label_274',
    name: 'R&S Records',
    email: 'demos@rsrecords.com',
    website: 'https://rsrecords.com',
    instagram: '@randsrecords',
    genre: 'Electronic / Other',
    region: 'Ghent, Belgium 🇧🇪',
    notes: 'Historical techno imprint. Seeking fast melodic-ambient techno, futuristic space soundscapes, and heavy hard hardware driving beats.',
    bestFitDescription: 'Futuristic sweep filters, fast hard snare arrays, cosmic modular arps.',
    status: 'Open'
  },
  {
    id: 'label_275',
    name: 'K7 Records',
    email: 'demos@k7.com',
    website: 'https://k7.com',
    instagram: '@k7records',
    genre: 'Electronic / Other',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Legendary DJ-Kicks curators. Looking for highly intellectual, cozy late-night bedroom house and alternative ambient grooves.',
    bestFitDescription: 'Cozy lo-fi drum beats, warm tape-humming baselines, nostalgic synth pads.',
    status: 'Open'
  },
  {
    id: 'label_276',
    name: 'Sonar Kollektiv',
    email: 'demos@sonarkollektiv.de',
    website: 'https://sonarkollektiv.com',
    instagram: '@sonarkollektiv',
    genre: 'Deep House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Jazzy and soulful organic house label. Seeks live instrumentation samples, brass arrangements, and warm emotional background strings.',
    bestFitDescription: 'Live acoustic horns, soulful vocal harmonies, rolling groovy basslines.',
    status: 'Open'
  },
  {
    id: 'label_277',
    name: 'Jazzanova Promo',
    email: 'promos@jazzanova.com',
    website: 'https://jazzanova.com',
    instagram: '@jazzanovaofficial',
    genre: 'Deep House',
    region: 'Berlin, Germany 🇩🇪',
    notes: 'Curated promo list of Jazzanova collective. Looking for organic Latin beats, smooth jazz vocals, and elegant Rhodes chords.',
    bestFitDescription: 'Warm Rhodes vintage keys, syncopated organic bossa rim patterns, soulful vocal hooks.',
    status: 'Open'
  },
  {
    id: 'label_278',
    name: 'Luaka Bop',
    email: 'demos@luakabop.com',
    website: 'https://luakabop.com',
    instagram: '@luakabop',
    genre: 'Electronic / Other',
    region: 'New York, United States 🇺🇸',
    notes: 'David Byrne’s exceptional world music and psych-electronic label. Sourcing highly alternative acoustic styles and acoustic-electronic hybrids.',
    bestFitDescription: 'Acoustic background textures, psych-fuzz synth leads, vintage hand-percussion steps.',
    status: 'Open'
  },
  {
    id: 'label_279',
    name: 'Stones Throw',
    email: 'demos@stonesthrow.com',
    website: 'https://stonesthrow.com',
    instagram: '@stonesthrow',
    genre: 'Electronic / Other',
    region: 'Los Angeles, United States 🇺🇸',
    notes: 'Elite organic bedroom beats and vintage instrumentals label. Seeking highly smoky analog chords, dusty tape loops, and quirky synthesizer bits.',
    bestFitDescription: 'Smoky vintage electric keyboards, extremely lazy drum layouts, dusty tape sound effects.',
    status: 'Open'
  },
  {
    id: 'label_280',
    name: 'Brainfeeder',
    email: 'demos@brainfeeder.net',
    website: 'https://brainfeeder.net',
    instagram: '@brainfeeder',
    genre: 'Electronic / Other',
    region: 'Los Angeles, United States 🇺🇸',
    notes: 'Flying Lotus’ high-concept experimental label. Seeks complex progressive space-jazz arps, glitched fast patterns, and heavy bass layouts.',
    bestFitDescription: 'Complex modular synth arps, fast energetic glitch steps, warm fusion double bass loops.',
    status: 'Open'
  },
  {
    id: 'label_281',
    name: 'Planet Mu',
    email: 'demos@planet.mu',
    website: 'https://planet.mu',
    instagram: '@planetmurecords',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Mike Paradinas’ forward-thinking footwork and IDM label. Demands hyper-fast syncopations, metallic synthesis arrays, and abstract baselines.',
    bestFitDescription: 'Hyper-fast hi-hat syncopations (150-160bpm), screaming metallic synths, abstract sub drops.',
    status: 'Open'
  },
  {
    id: 'label_282',
    name: 'Hyperdub',
    email: 'demos@hyperdub.net',
    website: 'https://hyperdub.net',
    instagram: '@hyperdubrecords',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Kode9’s elite UK garage and dubstep brand. Sourcing dark post-garage, heavy 2-step swings, futuristic space-pads, and moody microtonal clicks.',
    bestFitDescription: 'Moody 2-step garage beats, deep heavy sub bass hits, futuristic dark pad waves.',
    status: 'Open'
  },
  {
    id: 'label_283',
    name: 'Rephlex Records',
    email: 'demos@rephlex.com',
    website: 'https://instagram.com/rephlex_records',
    instagram: '@rephlex_records',
    genre: 'Electronic / Other',
    region: 'Cornwall, United Kingdom 🇬🇧',
    notes: "Historically significant 'Braindance' imprint once run by Aphex Twin. Sourcing high art retro-modern acid synths and whimsical modular sounds.",
    bestFitDescription: 'Whimsical modular lead designs, rapid vintage acid drum sequences.',
    status: 'Open'
  },
  {
    id: 'label_284',
    name: 'Skam Records',
    email: 'demos@skam.co.uk',
    website: 'https://skam.co.uk',
    instagram: '@skamrecords',
    genre: 'Electronic / Other',
    region: 'Manchester, United Kingdom 🇬🇧',
    notes: 'Elusive Northern IDM stable. Seeks cold industrial drum machines, eerie cinematic pads, and organic tape saturation backgrounds.',
    bestFitDescription: 'Eerie cinematic backgrounds, cold clockwork drum steps, dusty tape saturation edits.',
    status: 'Open'
  },
  {
    id: 'label_285',
    name: 'Duophonic Super 45s',
    email: 'demos@duophonic.co.uk',
    website: 'https://instagram.com/duophonic_super_45s',
    instagram: '@duophonic_super_45s',
    genre: 'Electronic / Other',
    region: 'London, United Kingdom 🇬🇧',
    notes: 'Boutique art-rock and analog electronic stable. Sourcing warm vintage Farfisa organs, fuzzy vintage bass lines, and motoric kraut rhythms.',
    bestFitDescription: 'Vintage farfisa organ washes, fuzzy retro analog baseline loops, steady motoric drumbeats.',
    status: 'Open'
  }
];

const DEFAULT_DB: Schema = {
  users: [],
  artistProfiles: [],
  demos: [],
  targets: [],
  outreaches: [],
  labels: SEED_LABELS,
  userFavorites: {}
};

function seedMockData(parsed: Schema) {
  if (parsed.users.some(u => u.id === 'user_seed_1')) return;

  const mockUsers: User[] = [
    {
      id: 'user_seed_1',
      email: 'alex.rivera@grooves.fm',
      name: 'Alex Rivera',
      createdAt: '2026-05-15T10:00:00.000Z',
      plan: 'starter',
      planStartDate: '2026-05-15T10:05:00.000Z'
    },
    {
      id: 'user_seed_2',
      email: 'sara.beats@clover.fm',
      name: 'Sara Chen',
      createdAt: '2026-05-12T14:22:00.000Z',
      plan: 'pro',
      planStartDate: '2026-05-12T14:30:00.000Z'
    },
    {
      id: 'user_seed_3',
      email: 'marcus.grooves@london.uk',
      name: 'Marcus Miller',
      createdAt: '2026-05-18T16:45:00.000Z',
      plan: 'free_trial',
      planStartDate: '2026-05-18T16:45:00.000Z'
    }
  ];

  const mockProfiles: ArtistProfile[] = [
    {
      id: 'prof_seed_1',
      userId: 'user_seed_1',
      artistName: 'SINK GROOVES',
      bio: 'Deep afro/organic collective blending live hand percussion with elegant analog synth leads.',
      genres: ['Afro House', 'Deep House'],
      targetTone: 'Professional & Humble',
      createdAt: '2026-05-15T10:10:00.000Z'
    },
    {
      id: 'prof_seed_2',
      userId: 'user_seed_2',
      artistName: 'SARA LABS',
      bio: 'Electronic explorer crafting atmospheric pads and melodic grooves straight from Portland.',
      genres: ['Melodic House', 'Deep House'],
      targetTone: 'Artistic & Deep',
      createdAt: '2026-05-12T14:35:00.000Z'
    },
    {
      id: 'prof_seed_3',
      userId: 'user_seed_3',
      artistName: 'M-GROOVE',
      bio: 'UK tech-house programmer focused on peak-time club weapons and dirty 909 hats.',
      genres: ['Tech House', 'Minimal / Deep Tech'],
      targetTone: 'Energetic & Bold',
      createdAt: '2026-05-18T16:50:00.000Z'
    }
  ];

  const mockDemos: Demo[] = [
    {
      id: 'demo_seed_1',
      userId: 'user_seed_1',
      title: 'Sunken Shaker',
      link: 'https://soundcloud.com/seed-user/sunken-shaker-demo',
      description: 'Lush organic shaker progressions with modular sub riffs.',
      mood: 'Organic',
      genre: 'Afro House',
      createdAt: '2026-05-15T11:00:00.000Z'
    },
    {
      id: 'demo_seed_2',
      userId: 'user_seed_2',
      title: 'Luminous Atmosphere',
      link: 'https://soundcloud.com/seed-user/luminous-atmosphere',
      description: 'Progressive modular pad sweep loops and delayed arpeggios.',
      mood: 'Spiritual',
      genre: 'Deep House',
      createdAt: '2026-05-12T15:00:00.000Z'
    },
    {
      id: 'demo_seed_3',
      userId: 'user_seed_3',
      title: 'Tech Roller 909',
      link: 'https://soundcloud.com/seed-user/tech-roller-909',
      description: 'Aggressive percussion loops with heavy subbass drive.',
      mood: 'Energetic',
      genre: 'Tech House',
      createdAt: '2026-05-18T17:00:00.000Z'
    }
  ];

  const mockOutreaches: Outreach[] = [
    {
      id: 'out_seed_1',
      userId: 'user_seed_1',
      demoId: 'demo_seed_1',
      targetId: 'label_1',
      targetName: 'Keinemusik',
      targetEmail: 'ar@keinemusik.com',
      status: 'sent',
      emailSubject: 'DEMO Submission: SINK GROOVES - Sunken Shaker',
      emailBody: 'Hey Keinemusik Crew,\n\nWe love your organic, spiritual sets at Ibiza and Hï. Here is our fresh track "Sunken Shaker", containing organic percussion and subtle modular synth layers engineered for your sunrise sets.\n\nStream demo here: https://soundcloud.com/seed-user/sunken-shaker-demo\n\nBest,\nSINK GROOVES',
      sentAt: '2026-05-16T12:00:00.000Z',
      createdAt: '2026-05-16T11:45:00.000Z',
      responseStatus: 'replied_interested',
      responseBody: 'Hey guys, Dixon here. Loving this rolling shaker grove! It will work perfectly for our sunrise set at DC-10 next Wednesday. Can you send over a high-quality WAV or AIFF download? Cheers.',
      respondedAt: '2026-05-16T15:30:00.000Z'
    },
    {
      id: 'out_seed_2',
      userId: 'user_seed_1',
      demoId: 'demo_seed_1',
      targetId: 'label_4',
      targetName: 'Defected Records',
      targetEmail: 'demos@defected.com',
      status: 'sent',
      emailSubject: 'DEMO Submission: SINK GROOVES - Sunken Shaker',
      emailBody: 'Hey Defected Records Team,\n\nCheck out our latest organic tech project "Sunken Shaker" for your consideration.\n\nStream link: https://soundcloud.com/seed-user/sunken-shaker-demo\n\nThanks,\nSINK GROOVES',
      sentAt: '2026-05-15T13:00:00.000Z',
      createdAt: '2026-05-15T12:50:00.000Z',
      responseStatus: 'replied_passed',
      responseBody: 'Thanks for submitting your track to Defected. While the groove is incredibly clean, we are looking for more traditional classic piano house structures this season. Best of luck! - Defected A&R',
      respondedAt: '2026-05-16T09:00:00.000Z'
    },
    {
      id: 'out_seed_3',
      userId: 'user_seed_2',
      demoId: 'demo_seed_2',
      targetId: 'label_5',
      targetName: 'Anjunadeep',
      targetEmail: 'submissions@anjunadeep.com',
      status: 'sent',
      emailSubject: 'DEMO: SARA LABS - Luminous Atmosphere Submission',
      emailBody: 'Dear Anjunadeep A&R,\n\nI am presenting "Luminous Atmosphere", a progression of sweeping lush pads and driving deep synth arrays crafted meticulously for your labels melodic space.\n\nDemo: https://soundcloud.com/seed-user/luminous-atmosphere\n\nWarmly,\nSara Chen',
      sentAt: '2026-05-13T10:00:00.000Z',
      createdAt: '2026-05-13T09:30:00.000Z',
      responseStatus: 'replied_interested',
      responseBody: 'Hi Sara, beautiful atmosphere on this! The deep warm delayed arpeggios are stellar. We want to consider it for Anjunadeep Explorations EP next month. Let\'s get in touch for licensing. - James | Anjunadeep A&R',
      respondedAt: '2026-05-13T16:00:00.000Z'
    },
    {
      id: 'out_seed_4',
      userId: 'user_seed_2',
      demoId: 'demo_seed_2',
      targetId: 'label_6',
      targetName: 'Innervisions',
      targetEmail: 'demos@innervisions.com',
      status: 'sent',
      emailSubject: 'DEMO: SARA LABS - Luminous Atmosphere',
      emailBody: 'Dear Innervisions Team,\n\nHere is my latest atmospheric piece "Luminous Atmosphere" for your consideration.\n\nLink: https://soundcloud.com/seed-user/luminous-atmosphere\n\nThanks,\nSara Chen',
      sentAt: '2026-05-14T09:00:00.000Z',
      createdAt: '2026-05-14T08:50:00.000Z',
      responseStatus: 'no_reply'
    },
    {
      id: 'out_seed_5',
      userId: 'user_seed_3',
      demoId: 'demo_seed_3',
      targetId: 'label_2',
      targetName: 'Solid Grooves',
      targetEmail: 'demos@solidgrooves.co.uk',
      status: 'sent',
      emailSubject: 'DEMO Submission: M-GROOVE - Tech Roller 909',
      emailBody: 'What is up Solid Grooves Crew!\n\nCheck out this peak-time tech rolling weapon "Tech Roller 909" with massive MPC swing claps and heavy subbass designed to destroy clubs.\n\nStream: https://soundcloud.com/seed-user/tech-roller-909\n\nRegards,\nM-GROOVE',
      sentAt: '2026-05-19T06:00:00.000Z',
      createdAt: '2026-05-19T05:50:00.000Z',
      responseStatus: 'replied_interested',
      responseBody: 'Mate, this snare roll drop is absolutely mental. Bibi and Pawsa played it yesterday at DC-10 and it went wild! Let\'s sign this on Solid Grooves Raw. Message us on Instagram to finalize the release details. - Solid Grooves A&R',
      respondedAt: '2026-05-19T09:30:00.000Z'
    }
  ];

  parsed.users.push(...mockUsers);
  parsed.artistProfiles.push(...mockProfiles);
  parsed.demos.push(...mockDemos);
  parsed.outreaches.push(...mockOutreaches);
  
  // Save seeded details immediately back
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write mock seeded data to files:', err);
  }
}

function readDb(): Schema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Always sync with the latest SEED_LABELS directory to roll out updates/flags/new artists safely
    parsed.labels = SEED_LABELS;
    
    if (!parsed.userFavorites) {
      parsed.userFavorites = {};
    }
    
    // Auto-seed mock statistical data if not present
    seedMockData(parsed);

    return parsed;
  } catch (error) {
    console.error('Error reading db.json, returning default db:', error);
    return DEFAULT_DB;
  }
}

function writeDb(data: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
}

export const db = {
  // Users
  getUser: (id: string): User | undefined => {
    const store = readDb();
    const found = store.users.find((u) => u.id === id);
    if (found && !found.plan) {
      found.plan = 'free_trial';
      found.planStartDate = found.createdAt;
    }
    return found;
  },
  createUser: (user: User): User => {
    const store = readDb();
    const existingIdx = store.users.findIndex((u) => u.id === user.id);
    if (existingIdx !== -1) {
      // Preserve existing plan details if modifying
      const existing = store.users[existingIdx];
      user.plan = existing.plan || (user.id === 'admin_nicholas' ? 'pro' : 'free_trial');
      user.planStartDate = existing.planStartDate || existing.createdAt || user.createdAt;
      store.users[existingIdx] = user;
    } else {
      user.plan = user.id === 'admin_nicholas' ? 'pro' : 'free_trial';
      user.planStartDate = new Date().toISOString();
      store.users.push(user);
    }
    writeDb(store);
    return user;
  },
  upgradeUser: (userId: string, plan: 'free_trial' | 'starter' | 'pro'): User | undefined => {
    const store = readDb();
    const idx = store.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      store.users[idx].plan = plan;
      store.users[idx].planStartDate = new Date().toISOString();
      writeDb(store);
      return store.users[idx];
    }
    return undefined;
  },

  // ArtistProfile
  getArtistProfile: (userId: string): ArtistProfile | undefined => {
    return readDb().artistProfiles.find((ap) => ap.userId === userId);
  },
  saveArtistProfile: (profile: ArtistProfile): ArtistProfile => {
    const store = readDb();
    const existingIdx = store.artistProfiles.findIndex((ap) => ap.userId === profile.userId);
    if (existingIdx !== -1) {
      store.artistProfiles[existingIdx] = profile;
    } else {
      store.artistProfiles.push(profile);
    }
    writeDb(store);
    return profile;
  },

  // Demos
  getDemos: (userId: string): Demo[] => {
    return readDb().demos.filter((d) => d.userId === userId);
  },
  getDemo: (id: string): Demo | undefined => {
    return readDb().demos.find((d) => d.id === id);
  },
  createDemo: (demo: Demo): Demo => {
    const store = readDb();
    store.demos.push(demo);
    writeDb(store);
    return demo;
  },
  deleteDemo: (id: string): boolean => {
    const store = readDb();
    const len = store.demos.length;
    store.demos = store.demos.filter((d) => d.id !== id);
    if (store.demos.length !== len) {
      writeDb(store);
      return true;
    }
    return false;
  },
  updateDemo: (id: string, updatedFields: Partial<Omit<Demo, 'id' | 'userId' | 'createdAt'>>): Demo | undefined => {
    const store = readDb();
    const demoIndex = store.demos.findIndex((d) => d.id === id);
    if (demoIndex !== -1) {
      store.demos[demoIndex] = { ...store.demos[demoIndex], ...updatedFields };
      writeDb(store);
      return store.demos[demoIndex];
    }
    return undefined;
  },

  // Targets / Custom recipients
  getTargets: (userId: string): Target[] => {
    return readDb().targets.filter((t) => t.userId === userId);
  },
  getTarget: (id: string): Target | undefined => {
    return readDb().targets.find((t) => t.id === id);
  },
  createTarget: (target: Target): Target => {
    const store = readDb();
    store.targets.push(target);
    writeDb(store);
    return target;
  },
  deleteTarget: (id: string): boolean => {
    const store = readDb();
    const len = store.targets.length;
    store.targets = store.targets.filter((t) => t.id !== id);
    if (store.targets.length !== len) {
      writeDb(store);
      return true;
    }
    return false;
  },

  // Outreaches
  getOutreaches: (userId: string): Outreach[] => {
    return readDb().outreaches.filter((o) => o.userId === userId);
  },
  getOutreach: (id: string): Outreach | undefined => {
    return readDb().outreaches.find((o) => o.id === id);
  },
  createOutreach: (outreach: Outreach): Outreach => {
    const store = readDb();
    store.outreaches.push(outreach);
    writeDb(store);
    return outreach;
  },
  updateOutreach: (outreach: Outreach): Outreach => {
    const store = readDb();
    const existingIdx = store.outreaches.findIndex((o) => o.id === outreach.id);
    if (existingIdx !== -1) {
      store.outreaches[existingIdx] = outreach;
      writeDb(store);
    }
    return outreach;
  },
  getTodayOutreachCount: (userId: string): number => {
    const store = readDb();
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return store.outreaches.filter((o) => {
      if (o.userId !== userId) return false;
      const dateStr = o.createdAt.split('T')[0];
      return dateStr === todayStr && o.status === 'sent';
    }).length;
  },

  // Labels Bank
  getLabels: (userId: string): Label[] => {
    const store = readDb();
    const labels = store.labels || SEED_LABELS;
    const favs = store.userFavorites?.[userId] || [];
    const userOutreaches = store.outreaches.filter(o => o.userId === userId && o.status === 'sent');

    return labels.map(lbl => {
      // Find latest outreach to this specific label
      const matchingOutreaches = userOutreaches.filter(o => o.targetId === lbl.id);
      let lastContactedAt: string | undefined = undefined;
      if (matchingOutreaches.length > 0) {
        // Sort latest first
        matchingOutreaches.sort((a, b) => new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime());
        lastContactedAt = matchingOutreaches[0].sentAt || matchingOutreaches[0].createdAt;
      }

      return {
        ...lbl,
        isFavorite: favs.includes(lbl.id),
        lastContactedAt
      };
    });
  },
  createLabel: (label: Label): Label => {
    const store = readDb();
    if (!store.labels) store.labels = [];
    store.labels.push(label);
    writeDb(store);
    return label;
  },
  toggleFavoriteLabel: (userId: string, labelId: string): boolean => {
    const store = readDb();
    if (!store.userFavorites) store.userFavorites = {};
    if (!store.userFavorites[userId]) {
      store.userFavorites[userId] = [];
    }
    const favList = store.userFavorites[userId];
    const index = favList.indexOf(labelId);
    let isFav = false;
    if (index !== -1) {
      favList.splice(index, 1);
    } else {
      favList.push(labelId);
      isFav = true;
    }
    writeDb(store);
    return isFav;
  },
  
  // Admin Methods
  getAllUsers: () => {
    const store = readDb();
    return store.users.map(u => {
      const profile = store.artistProfiles.find(p => p.userId === u.id);
      const userDemos = store.demos.filter(d => d.userId === u.id);
      const userOutreaches = store.outreaches.filter(o => o.userId === u.id);
      
      return {
        ...u,
        artistName: profile?.artistName || 'No Profile Created',
        demosCount: userDemos.length,
        outreachesSent: userOutreaches.filter(o => o.status === 'sent').length,
        outreachesDraft: userOutreaches.filter(o => o.status === 'draft').length,
        repliesReceived: userOutreaches.filter(o => o.responseStatus && o.responseStatus !== 'no_reply').length
      };
    });
  },
  
  deleteUser: (userId: string): boolean => {
    const store = readDb();
    const len = store.users.length;
    store.users = store.users.filter(u => u.id !== userId);
    
    if (store.users.length !== len) {
      store.artistProfiles = store.artistProfiles.filter(p => p.userId !== userId);
      store.demos = store.demos.filter(d => d.userId !== userId);
      store.targets = store.targets.filter(t => t.userId !== userId);
      store.outreaches = store.outreaches.filter(o => o.userId !== userId);
      if (store.userFavorites) {
        delete store.userFavorites[userId];
      }
      writeDb(store);
      return true;
    }
    return false;
  },
  
  getAdminStats: () => {
    const store = readDb();
    const allOutreaches = store.outreaches;
    const sent = allOutreaches.filter(o => o.status === 'sent');
    const replies = sent.filter(o => o.responseStatus && o.responseStatus !== 'no_reply');
    const interested = sent.filter(o => o.responseStatus === 'replied_interested');
    const passed = sent.filter(o => o.responseStatus === 'replied_passed');
    
    return {
      totalUsers: store.users.length,
      totalProfiles: store.artistProfiles.length,
      totalDemos: store.demos.length,
      totalPitches: allOutreaches.length,
      sentCount: sent.length,
      draftsCount: allOutreaches.filter(o => o.status === 'draft').length,
      repliesCount: replies.length,
      interestedCount: interested.length,
      passedCount: passed.length,
      responseRate: sent.length > 0 ? parseFloat(((replies.length / sent.length) * 100).toFixed(1)) : 0,
      outreaches: allOutreaches.map(o => {
        const user = store.users.find(u => u.id === o.userId);
        return {
          ...o,
          userName: user?.name || user?.email || 'Unknown User'
        };
      })
    };
  }
};
