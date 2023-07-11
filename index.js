#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';

import { Configuration, OpenAIApi } from "openai";

import dotenv from 'dotenv'
dotenv.config()

const MODEL = "gpt-3.5-turbo";
const TEMPERATURE = 0.6;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const submitPrompt = async (messages) => {
    try {
        const completion = await openai.createChatCompletion({
            model: MODEL,
            messages: messages,
            temperature: TEMPERATURE
        });
        return completion.data.choices[0].message.content;
    } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
    }
}

const init = () => {
    console.log(
        chalk.green(
            figlet.textSync("Chatbot CLI")
        )
    );

    console.log(
        chalk.green(
            "Type in your prompt(s). The whole conversation will be taken into account when a prompt is answered. Enter 'exit' in order to end the conversation.\n"
        )
    );
}

const getprompt = () => {
    
    const prompt = [
      {
        name: 'prompt',
        type: 'input',
        prefix: 'Your prompt    >',
        message: ' '
      }
    ];
    
    return inquirer.prompt(prompt);
};

const prompting = async () => {
   
    let history = [];
    let prompt;

    while (true) {
        
        prompt = (await getprompt()).prompt;

        if (prompt === "exit") {
            break;
        }

        const messages = [];
        
        for (const [prompt, completion] of history) {
            messages.push({ role: "user", content: prompt });
            messages.push({ role: "assistant", content: completion });
        }

        messages.push({ role: "user", content: prompt});

        // API call
        let completion = await submitPrompt(messages) // this needs to be replaced with answer from API call
        
        // console logs
        console.log(" ");
        console.log(chalk.blue(MODEL), chalk.blue(" >  "), chalk.blue(completion));
        console.log(" ");

        // fill arrays
        history.push([prompt, completion]);
    
    }

    return history;

}

const run = async () => {
    init();

    let history = await prompting();
    
    console.log(" ");
    console.log("This was the recorded history: ", history);

    console.log(" ");
    console.log(chalk.blue("Goob bye!"));
    console.log(" ");
};

run();