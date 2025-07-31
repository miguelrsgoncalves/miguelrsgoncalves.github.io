const tabsEnum = {
  home: "home",
  projects: "projects",
  about: "about"
}

const pagesEnum = new Map([
    ["portfolio", "Portfolio"],
]);

/**
 * Used for having the title of the project when loading a page.
 * 
 * Everytime a project title is updated it needs to be updated here and in the projects.json
 */
const projectsEnum = new Map([
    ["abyssal-descent", "Abyssal Descent: SCP-455"],
    ["chat95", "Chat95"],
    ["god-simulator", "Hand of God"],
    ["grass-field", "Sea Above Water"],
    ["limbo-gaol", "Limbo's Gaol"],
    ["narrow-escape", "Narrow Escape"],
    ["papers-please-the-short-film-spatial-audio-only-adaptation", "PAPERS, PLEASE - The Short Film | Spatial Audio-Only Adaptation"],
    ["paranoia", "Paranoia"],
    ["play-with-me", "PLAY WITH ME"],
    ["sisyphus-climb", "Sisyphus Climb"],
    ["webgl-bird-game", "Egg Hunt"],
    ["webgl-train-game", "WebGL Train"],
    ["well-of-wandering", "Well of Wandering"],
]);