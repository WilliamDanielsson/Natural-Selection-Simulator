/* 
Class that generates random names for the Species
*/

export default class NameGenerator {
    constructor () {
        // List of adjectives
        this.adjectives = [
            'Thunder', 'Mighty', 'Electric', 'Fierce', 'Swift', 'Savage', 'Golden', 'Brave', 'Daring', 'Radiant',
            'Vibrant', 'Glorious', 'Noble', 'Fearless', 'Epic', 'Valiant', 'Legendary', 'Majestic', 'Renegade',
            'Furious', 'Unstoppable', 'Victorious', 'Supreme', 'Mystic', 'Ethereal', 'Triumphant', 'Divine',
            'Intrepid', 'Invincible', 'Spectacular', 'Gallant', 'Robust', 'Wondrous', 'Resolute', 'Dazzling',
            'Indomitable', 'Tenacious', 'Dauntless', 'Exalted', 'Grand', 'Gallant', 'Mightiest', 'Unbeatable',
            'Boundless', 'Stellar', 'Everlasting', 'Fearless', 'Unyielding', 'Unforgettable', 'Infinite', 'Epic',
            'Vivid', 'Unwavering', 'Magnificent', 'Energetic', 'Stalwart', 'Titanic', 'Radiant', 'Heroic', 'Fearless',
            'Vigilant', 'Swift', 'Imperial', 'Fantastic', 'Courageous', 'Luminous', 'Triumphant', 'Mysterious',
            'Enigmatic', 'Dynamic', 'Valorous', 'Stunning', 'Brilliant', 'Tenacious', 'Empowered', 'Breathtaking',
            'Bold', 'Limitless', 'Commanding', 'Harmonious', 'Inspiring', 'Exquisite', 'Regal', 'Supreme',
            'Unforgettable', 'Epic', 'Resplendent', 'Fearless', 'Unstoppable', 'Unbreakable', 'Radiant', 'Ethereal',
            'Indomitable', 'Visionary', 'Dominant', 'Peerless', 'Astounding', 'Sensational', 'Unassailable'
            ];

        // List of nouns
        this.nouns = [
            'Snapper', 'Hunks', 'Slam', 'Dunkers', 'Warriors', 'Titans', 'Dragons', 'Champions', 'Lions', 'Pirates',
            'Tigers', 'Juggernauts', 'Spartans', 'Gladiators', 'Hurricanes', 'Legends', 'Cobras', 'Phantoms', 'Ravens',
            'Wolves', 'Samurais', 'Guardians', 'Knights', 'Sirens', 'Rebels', 'Mavericks', 'Vikings', 'Hawks', 'Panthers',
            'Saviors', 'Reapers', 'Avengers', 'Storm', 'Ninjas', 'Bandits', 'Outlaws', 'Raiders', 'Centurions', 'Legion',
            'Emperors', 'Warlords', 'Conquerors', 'Monarchs', 'Sentinels', 'Gladiators', 'Challengers', 'Crusaders',
            'Barbarians', 'Destroyers', 'Gladiators', 'Warlocks', 'Enforcers', 'Commanders', 'Executors', 'Vipers',
            'Pharaohs', 'Guardians', 'Raptors', 'Colossus', 'Destroyers', 'Heroes', 'Phenoms', 'Chargers', 'Rebels',
            'Blitz', 'Titans', 'Rebels', 'Assassins', 'Phenoms', 'Phantoms', 'Dominators', 'Rangers', 'Crushers',
            'Bombers', 'Demons', 'Rockets', 'Explorers', 'Chargers', 'Aces', 'Devils', 'Screamers', 'Wildcats',
            'Highlanders', 'Dragons', 'Stallions', 'Bulldogs', 'Chiefs', 'Gladiators', 'Dynasty', 'Hornets', 'Sharks',
            'Patriots', 'Legends', 'Guardians', 'Havoc', 'Nemesis', 'Phoenix', 'Sentinels', 'Wizards', 'Rangers',
            'Fury', 'Steel', 'Storm', 'Pioneers', 'Samurai', 'Defenders', 'Saber', 'Sultans', 'Steelers', 'Storm',
            'Crusaders', 'Commandos', 'Warriors'
        ];

        // List of other words that can be used to create cool names, currently only have "The" 
        this.otherWords = ["The"]
    }

    /* 
    Generate a Species name, by picking words from the lists of words.
    Switch Cases decides whether or not it will be a One worded name such as "The Samurais"
    or if it will be a Double worded name such as "PeerlessChargers". 
    */
    generateRandomTeamName () {
        let name = ""

        const typeOfNamesArray = ["singleWorded", "doubleWorded"]
        let typeOfName = typeOfNamesArray[Math.floor(Math.random() * typeOfNamesArray.length)] // Decide if it will be a one or double worded name

        switch (typeOfName) {
            case "singleWorded":
                const adjectiveAndNounArray = ["adjective", "noun"]
                // Decide if the name will be picked from the adjective or noun list
                let adjectiveOrNoun = adjectiveAndNounArray[Math.floor(Math.random() * adjectiveAndNounArray.length)]

                switch (adjectiveOrNoun) {
                    case "adjective":
                        // Pick a random word from the OtherWords list (THE) and then a random word from the adjective list
                        name = this.otherWords[Math.floor(Math.random() * this.otherWords.length)] + " " + this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
                    break;

                    case "noun":
                        // Pick a random word from the OtherWords list (THE) and then a random word from the noun list
                        name = this.otherWords[Math.floor(Math.random() * this.otherWords.length)] + " " + this.nouns[Math.floor(Math.random() * this.nouns.length)];
                    break;
                }
            break;
        
            case "doubleWorded":
                // Pick a random word from the adjective list and then a random word from the noun list
                name = this.adjectives[Math.floor(Math.random() * this.adjectives.length)] + this.nouns[Math.floor(Math.random() * this.nouns.length)];
            break;
    
          }

        // Return the newly created name
        return name
      }
}