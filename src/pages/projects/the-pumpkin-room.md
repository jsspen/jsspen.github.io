---
layout: page.njk
title: The Pumpkin Room
eleventyNavigation:
    key: The Pumpkin Room
    parent: Projects
---

## The Pumpkin Room
[GitHub Repo](https://github.com/jsspen/the-pumpkin-room/)

<b>Ingredients</b>: TypeScript, Angular, Tailwind, Node.js, PostgreSQL, RESTful API, Mermaid.js

_*Why?*_ I wanted to build something complex and full stack but I also wanted to make something out of the ordinary! I've always enjoyed writing, I have twin daughters who love reading and Halloween, it was October when I began, and it seemed like a fun challenge to test my skills. Like any good game it has multi-user support, the ability to save and load progress, persistent data through multiple play-throughs for achivement tracking, and unpredictable path generation!

_Details on why I chose the various technologies I chose along with snippets of relevant code can be found below. This is a fullstack app so there's a lot more code to see, plus this is all under active development, so head to the repo to dig in and see the latest!_

---

<div align="center">
  
<img src="https://github.com/jsspen/the-pumpkin-room/blob/main/thepumpkinroom-fe/public/imgs/01.jpg?raw=true" alt="A dark photo of a house in the woods" width="350"/>

_You wake up standing at the door of a strange house deep in the woods..._<br/>

<b>The Pumpkin Room</b> is a spooky, text-based & story-driven game that I wrote for my daughters.

</div>

## Pumpkin Guts

### Game Logic: TypeScript

TypeScript handles the core logic of the game, tracking the player's choices, branching the story, and managing game states. I chose TypeScript to make the codebase more scalable and easier to debug, especially as the game inevitably grows in complexity.

```ts
// thepumpkinroom-fe/src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StoryService } from './story.service';

import { Choice } from './models/choice.model';
import { StoryPart } from './models/story-part.model';
import { Question } from './models/question.model';
import { Profile } from './models/profile.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'The Pumpkin Room';
  hasSelectedGame = false;
  showNewGameForm = false;
  hasStartedGame = false;
  errorMessage: string | null = null;
  content: StoryPart | null = null;
  questions: Question[] = [];
  question: Question | null = null;
  choices: Choice[] = [];
  userName: string = '';
  storyText: string = '';
  profile: Profile | null = null;

  constructor(private storyService: StoryService) {}

  fetchStoryPart(id: number) {
    this.storyService.getStoryPart(id).subscribe(
      (response: StoryPart) => {
        this.content = response;
        this.storyText = this.content?.text;
        this.questions = this.content?.questions;

        if (this.questions?.length > 0) {
          const randomIndex = Math.floor(Math.random() * this.questions.length);
          this.question = this.questions[randomIndex];
        }
      },
      (error) => {
        console.error('Error fetching StoryPart', error);
      }
    );
  }

  makeChoice(choice: Choice) {
    this.fetchStoryPart(choice?.nextStoryPartId);
    // this.profile = this.storyService.getProfile();
  }

  newGame() {
    this.hasSelectedGame = true;
    this.showNewGameForm = true;
  }

  newPlayer(userName: string) {
    this.storyService.createNewPlayer(userName).subscribe((response) => {
      console.log('Player created:', response);
    });
  }

  submitNewGame() {
    if (this.userName) {
      this.storyService.createNewPlayer(this.userName).subscribe(
        (response) => {
          console.log('Player created:', response);
          this.errorMessage = null;
          this.hasStartedGame = true;
          this.fetchStoryPart(1);
          this.showNewGameForm = false;
        },
        (error) => {
          this.errorMessage = error.error
            ? error.error.error
            : 'An error occurred';
        }
      );
    } else {
      this.errorMessage = 'Please enter a valid username';
    }
  }

  loadGame() {
    this.hasSelectedGame = true;
    this.showNewGameForm = true;
  }

  resetGame() {
    this.storyService.resetGame(this.userName).subscribe((response) => {
      console.log('Game Reset', response);
    });
    this.fetchStoryPart(1);
  }
}
```

### UI: Angular, Tailwind

Angular provides the modular, component-based architecture for the user interface. I chose Angular for its two-way data binding, which makes it easy to update the game state and reflect changes in the UI. I used Tailwind for easy to manage, flexible, and consistent styling.

```HTML
&lt;!-- thepumpkinroom-fe/src/app/app.component.html --&gt;
&lt;div class="p-6 text-white"&gt;
  &lt;h1 class="p-6 text-4xl font-bold underline font-underdog"&gt;{{ title }}&lt;/h1&gt;

  &lt;!-- landing page --&gt;
  &lt;div *ngIf="!hasSelectedGame"&gt;
    &lt;button class="hover:font-semibold hover:underline" (click)="newGame()"&gt;
      Begin
    &lt;/button&gt;
    |
    &lt;button class="hover:font-semibold hover:underline" (click)="loadGame()"&gt;
      Load
    &lt;/button&gt;
  &lt;/div&gt;

  &lt;!-- New game form for username input --&gt;
  &lt;div *ngIf="showNewGameForm"&gt;
    &lt;label for="name-input" class="font-underdog italic"
      &gt;What is your name?&lt;/label
    &gt;
    &lt;br /&gt;&lt;br /&gt;
    &lt;input
      id="name-input"
      type="text"
      class="p-4 border border-grey-300 rounded-lg bg-grey-50 text-base"
      [(ngModel)]="userName"
    /&gt;&lt;br /&gt;&lt;br /&gt;
    &lt;button
      class="hover:font-semibold hover:underline font-underdog"
      (click)="submitNewGame()"
    &gt;
      Submit
    &lt;/button&gt;
  &lt;/div&gt;

  &lt;!-- Error message if username is taken --&gt;
  &lt;div *ngIf="errorMessage"&gt;
    &lt;p&gt;{{ errorMessage }}&lt;/p&gt;
  &lt;/div&gt;

  &lt;div *ngIf="hasStartedGame"&gt;
    &lt;p class="p-12"&gt;{{ storyText }}&lt;/p&gt;
    &lt;p class="font-underdog text-xl"&gt;
      &lt;i&gt;{{ question?.text }}&lt;/i&gt;
    &lt;/p&gt;
    &lt;div *ngIf="(questions[0].choices || []).length &gt; 0"&gt;
      &lt;br /&gt;&lt;br /&gt;

      &lt;div class="flex flex-wrap justify-center items-center space-x-2"&gt;
        &lt;ng-container
          *ngFor="let choice of questions[0].choices; last as isLast"
        &gt;
          &lt;button
            class="font-semibold hover:underline font-underdog min-w-max"
            (click)="makeChoice(choice)"
          &gt;
            {{ choice?.text }}
          &lt;/button&gt;
          &lt;span *ngIf="!isLast" class="mx-2"&gt;or&lt;/span&gt;
        &lt;/ng-container&gt;
      &lt;/div&gt;

      &lt;br /&gt;
      &lt;button
        class="fixed bottom-0 left-0 right-0 mx-auto text-sm mb-4 p-2 font-medium hover:underline font-underdog italic"
        (click)="resetGame()"
      &gt;
        Start Over
      &lt;/button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;
```

### Backend: Node.js, PostgreSQL, RESTful API, Sequelize

Story text, questions, and possible options are stored across three tables in a PostgreSQL database to increase flexibility and modularity. Data is fetched from the API using Sequelize. A fourth table stores player profiles which include username, game profile, and history. The player history persists across story resets, allowing you to see how many of the potential decisions you have faced in the game. Replay and take new paths to uncover all the possibilities.

```js
// thepumpkinroom-be/app.js

const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");

const storyRoutes = require("./routes/storyRoutes");
const profileRoutes = require("./routes/profileRoutes");

const Question = require("./models/Question");
const StoryPart = require("./models/StoryPart");
const Choice = require("./models/Choice");

const app = express();
app.use(bodyParser.json());

app.use("/api", storyRoutes);
app.use("/api", profileRoutes);

Question.belongsTo(StoryPart, { foreignKey: "storyPartId", as: "storyPart" });
Question.hasMany(Choice, { as: "choices", foreignKey: "questionId" });
Choice.belongsTo(Question, { foreignKey: "questionId", as: "question" });
StoryPart.hasMany(Question, { as: "questions", foreignKey: "storyPartId" });

// Sync models with the database
sequelize.sync({ alter: true }).then(() => {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
```

```js
// thepumpkinroom-be/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// creating a new player - POST
router.post("/profile", async (req, res) => {
  try {
    const { userName } = req.body;
    console.log("userName:", userName);
    // check for existing username
    const existingUser = await Profile.findOne({ where: { userName } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
      // This username already exists. Do you want to load your game?
    }

    const profile = await Profile.create({
      userName,
    });
    res.json(profile);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// updating & resetting profile - PUT
// updating/saving: currentStoryPartId = this.currentStoryPartId,
//      choicesMade = this.choicesMade, completed = this.completed
// reset: currentStoryPartId = 1, completed = false

module.exports = router;
```

```js
// thepumpkinroom-be/models/Profile.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Profile = sequelize.define(
  "Profile",
  {
    userName: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    currentStoryPartId: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    choicesMade: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Profile;
```

### The Story

I wrote all of the text in the game, no LLMs involved, and I retain all rights to it. To keep from going crosseyed while creating all the branching and looping pieces of the game I used a plain old spreadsheet and a flowchart "map" written in <b>Mermaid.js</b>. The mermaid chart can be found in the backend directory.
