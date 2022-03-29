import fs from 'fs';
import path from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPPORTED_LOCALES = ['en', 'pl'];

class TranslationService {
	private _messages;
	public locales;
	constructor(locales: string[]) {
		this._messages = {};
		this.locales = locales;
	}

	addLocales() {
		this.locales.forEach((loc) => {
			this._messages[loc] = {};
		});
		return this;
	}
	initializeSectors(sector: string) {
		this.locales.forEach((loc: string) => {
			this._messages[loc][sector] = {};
		});
		return this;
	}
	addSector(locale: string, sector: string, content: any) {
		this._messages[locale][sector] = content;
		return this;
	}
	get messages() {
		return this._messages;
	}
}

function generateTranslations() {
	const translationService = new TranslationService(SUPPORTED_LOCALES);
	translationService.addLocales();

	fs.readdirSync(path.join(__dirname, '..', 'locales')).forEach((sector) => {
		translationService.initializeSectors(sector);

		fs.readdirSync(path.join(__dirname, '..', `locales/${sector}/`)).forEach(
			(file) => {
				const content = fs.readFileSync(
					path.join(__dirname, '..', `locales/${sector}/${file}`),
					{
						encoding: 'utf-8',
					}
				);
				const locationFile = file.split('.json');
				const [locale] = locationFile;
				translationService.addSector(locale, sector, JSON.parse(content));
			}
		);
	});

	return translationService.messages;
}

export default async function (req: VercelRequest, res: VercelResponse) {
	const messages = generateTranslations();
	return res.json(messages);
}
