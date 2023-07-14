#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';

import { Configuration, OpenAIApi } from "openai";

import dotenv from 'dotenv'
dotenv.config()

const MODEL = "davinci";
const TEMPERATURE = 0.3;
const MAX_TOKENS = 150;
const FREQUENCY_PENALTY = 0.0;
const PRESENCE_PENALTY = 0.6;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const init = () => {
    console.log(
        chalk.green(
            figlet.textSync("Chatbot CLI")
        )
    );
    let welcomeString = `Type in your prompt(s) to \`${MODEL}\`. The whole conversation will be taken into account when a prompt is answered. Enter \'exit\' in order to end the conversation.\n`
    console.log(
        chalk.green(welcomeString)
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

const chatCompletion = async (history, prompt) => {  
    let completion;
    const messages = [];   
    for (const [prompt, completion] of history) {
        messages.push({ role: "user", content: prompt });
        messages.push({ role: "assistant", content: completion });
    }
    messages.push({ role: "user", content: prompt});

    // API call
    try {
        completion = await openai.createChatCompletion({
            model: MODEL,
            messages: messages,
            temperature: TEMPERATURE
        });
        
        completion = completion.data.choices[0].message.content;
    
    } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
    }

    // fill arrays
    history.push([prompt, completion]);

    return completion;
}

const completionLegacy = async (history, prompt) => {
    
    history = history + 'user: ' + prompt + '\n' + 'assistant: ';
    let completion;

    // API call
    try {
        completion = await openai.createCompletion({
            model: MODEL,
            prompt: history,
            temperature: TEMPERATURE,
            max_tokens: MAX_TOKENS,
            frequency_penalty: FREQUENCY_PENALTY,
            presence_penalty: PRESENCE_PENALTY,
            stop: ["user:", " assistant:"],
        });
        completion = completion.data.choices[0].text;
    } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
    }
    
    // append to history
    history = history + completion + '\n';

    return [completion, history];
}

const prompting = async () => {
   
    let prompt;
    let history;
    let historyChat = [];
    let historyCompletion = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nuser: Hello, who are you?\nassistant: I am an AI created by OpenAI. How can I help you today?\n";

    while (true) {
        let completion;
        prompt = (await getprompt()).prompt;
        if (prompt === "exit") {
            break;
        }
        if (MODEL==="gpt-3.5-turbo" || MODEL==="gpt-4") {
                history = historyChat;
                completion = await chatCompletion(history, prompt);
        } else {
                history = history + historyCompletion;
                [completion, history] = await completionLegacy(history, prompt);
        }

        // console logs
        console.log(" ");
        console.log(chalk.blue(MODEL), chalk.blue(" >  "), chalk.blue(completion));
        console.log(" ");
    
    }

    return history;

}

const run = async () => {
    init();

    let history = await prompting();

    console.log(" ");
    console.log(chalk.blue("This is the history: \n" + history));
    console.log(" ");

    console.log(" ");
    console.log(chalk.blue("Goob bye!"));
    console.log(" ");
};

run();