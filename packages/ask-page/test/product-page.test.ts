import { expect, it } from "vitest"
import { AskPage } from "../src/controller"
import { Window } from "happy-dom"

const card = (h: string, sub: string, body: string) => `<a href="#"><div class="card"><h3>${h}</h3><span>${sub}</span><p>${body}</p><span>See product</span></div></a>`
const athletes = ["Vasco Vilaça|Talent is simply the work done while no one is watching","Evie Richards|On the day of my race I have a Red Bull to get my wiiings!","Jack Nowell|On match day, I have two cans of Red Bull: one pre-match and one at half time.","Danny MacAskill|I drink Red Bull for the motivation to land the tricks I've dreamed of doing for years","Max Verstappen|After the finish we usually have many meetings – Red Bull definitely comes in handy then","Lucy Charles-Barclay|I love to enjoy a Red Bull on race days","James Spithill|I drink Red Bull right before I go out on the water","Jason Paul|I like to drink Red Bull as a refreshment during the day, it's all about the enjoyment"]
const HTML = `<main><h1>Red Bull Energy Drinks</h1>
${card("The Original Red Bull","","Red Bull Energy Drink is appreciated worldwide by top athletes, busy professionals, students and travelers on long journeys.")}
${card("Red Bull Zero","Zero Calories. 100% Wiiings","Enjoy the taste of Red Bull Zero. Without sugar.")}
${card("Sugarfree Energy Drink","Wiiings Without Sugar","Same benefits of the original Energy Drink - without sugar.")}
<h2>Giving wiiings to people &amp; ideas since 1987</h2><h3>Red Bull Company</h3><a>Explore Company</a>
<h2>Athlete features</h2>${athletes.map(a=>{const [n,q]=a.split("|");return `<div><h3>${n}</h3><p>${q}</p><a>Learn more</a></div>`}).join("")}
<h2>Sustainability</h2><p>A can could have more than one life.</p><p>Red Bull focuses on proper handling of packaging and cans, and on reducing carbon emissions and energy use in production and supply.</p>
<h2>World of Red Bull</h2><ul><li>Without ride-by-wire: How the Suzuki GSX-R750 becomes Supersport-compliant</li><li>Lewis Hamilton on Kimi Antonelli: How one champion rates another</li><li>McLaren team principal Andrea Stella explains: What went wrong in qualifying</li></ul></main>`

// A product page (text of redbull.com/int-en/energydrink): the answer is there
// in other words ("Sugarfree", "without sugar"), so Ask page must find it.
it("finds a product page answer worded differently", async () => {
  const w = new Window({ url: "https://www.redbull.com/int-en/energydrink" })
  w.document.write(`<html><head><title>Red Bull Energy Drinks</title></head><body>${HTML}</body></html>`)
  const p = new AskPage({ doc: w.document as any, worker: false })
  for (const q of ["is red bull without sugar", "Is Red Bull sugar free?", "is there sugar free red bull", "does red bull have a sugar-free version", "red bull no sugar"]) {
    const a = await p.ask(q)
    expect(a.kind, q).toBe("quote")
    expect(a.text.toLowerCase(), q).toContain("without sugar")
  }
  for (const q of ["what is the price of red bull", "is there a mobile app"]) expect((await p.ask(q)).kind, q).toBe("unknown")
  p.dispose()
})
