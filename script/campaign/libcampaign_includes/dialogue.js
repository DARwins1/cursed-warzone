
////////////////////////////////////////////////////////////////////////////////
// Functions related to mid-mission messages (that aren't sequences)
////////////////////////////////////////////////////////////////////////////////


//;; ## camQueueDialogue(text, delay[, sound])
//;; Queues up a dialogue, consisting of the text to be displayed, 
//;; the delay, and the sound file to be played (if any).
//;;
//;; @param {string} text
//;; @param {number} delay
//;; @param {string} sound
//;; @returns {void}
//;;
function camQueueDialogue(text, delay, sound)
{
	if (!camIsString(text))
	{
		// Got an object instead of 3 different inputs
		sound = text.sound;
		delay = text.delay;
		text = text.text;
	}
	__camQueuedDialogue.push({text: text, time: gameTime + delay, sound: sound})
}

//;; ## camQueueDialogues(dialogues)
//;; Takes an array of dialogues and queues them up.
//;;
//;; @param {object[]} dialogue
//;; @returns {void}
//;;
function camQueueDialogues(dialogues)
{
	for (const diaInfo of dialogues)
	{
		const text = diaInfo.text;
		const delay = diaInfo.delay;
		const sound = diaInfo.sound;
		camQueueDialogue(text, delay, sound)
	}
}

//////////// privates

// Find any dialogues in the queue that are due to play.
// If any are found, print the text, play the sound (if applicable),
// and then remove from the queue.
function __camPlayScheduledDialogues()
{
	const newQueue = [];
	for (const diaInfo of __camQueuedDialogue)
	{
		if (diaInfo.time <= gameTime)
		{
			// Play the dialogue (and then forget it)
			console(diaInfo.text);
			if (camDef(diaInfo.sound))
			{
				playSound(diaInfo.sound);
			}
		}
		else
		{
			// Save it in the queue
			newQueue.push(diaInfo);
		}
	}
	__camQueuedDialogue = newQueue;
}