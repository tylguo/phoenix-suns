## Getting Started

First, run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the provided URL) to view the application.

The app loads static play-by-play data from `src/data/play-by-play.json` and displays it in an easy-to-scan interface.

## Technical Decisions

### Stack Choice
This app was built using Vite, React, TypeScript, and Tailwind CSS. I chose this combination because Vite is modern and fast for development. React was used for its component based architecture, meaning the feed, team aggregate and custom feature are built to be reusable. I am using TypeScript to ensure that the unstructured JSON data is handled safely. Tailwind CSS is used for easy styling while also looking neat.

### Trade-offs
 - Client-side data processing is simple but could be slow for very large datasets; server-side aggregation would scale better but adds complexity.

 - Tailwind speeds up development but can lead to verbose class strings but it's acceptable for this project size.

 - The app just reads from a static JSON file which doesn't even cover a whole game. The upside is that is simple to implement and ensures reproducibility. However, it's not really indicative of realistic game scenario as there's no real time data.

## Data Findings

Here are several interesting patterns I came across:

 - A pattern in the data that stuck out to me immediately is how the `clock` times were formatted. It was formatted as ISO 8601 durations (PT12M00.00S) rather than a readable string (MM:SS). This was handled in `src/components/PlayByPlayFeed.tsx` with helper function that parses these strings using regex to extract minutes and seconds.

 - Furthermore, when coding the logic for how the play by play feed will be ordered, I immediately jumped to ordering by `clock`, but I noticed that different events can happen at the same time which meant `clock` is not a reliable way to sort. I handled this by using `orderNumber` instead.

 - `scoreHome` and `scoreAway` are strings ("2") not numbers. This is not really important to my implementation, but in the case I want to calculate something like total points, I would handle strings by first normalizing them into integers before any calculations. 

 - Many fields have null values such as `x`, `y`, and `qualifiers`. This indicates that they are only relevant for specific action types. Another interesting observation is that certain actions have extra fields. For example, jump balls has `jumpBallWonPersonId`, `jumpBallLostPersonId`. Fouls also contains info about who drew the foul `foulDrawnPlayerName`. This is handled through optioinal fields in `PlayAction` interface; TypeScript definitions mark them as optional or nullable. The `[key: string]: any;` makes it so it allows the app to handle any extra vendor-specific fields without breaking TypeScript. This is more important in a more general sense as in this assessment, the data comes from a static JSON file. 

## Feature Description

The custom feature I chose to implement is a player comparison tool. This tool allowing coaches to compare two players' stats side-by-side from the game's play-by-play data. You can select players via dropdowns to view metrics like PTS, FGM-FGA, FG%, 3PTM-3PTA, 3PT%, FTM-FTA, FT%, OREB, DREB, and AST in a clean table.

This helps coaches evaluate matchups to ensure that his player is not a mismatch. It also can help with indentifying weaknesses if a certian player has higher metrics 

## AI Disclosure
