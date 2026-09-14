import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { OpenRouterService } from './services/open-router.service';
import { environment } from '../environments/environment';

export interface ResponseCard {
  model: string;
  content: string;
}

export interface HistoryEntry {
  timestamp: Date;
  prompt: string;
  temperature?: number;
  responses: ResponseCard[];
}

const EXAMPLE_PROMPTS = [
  "Explique en 2 phrases simples le principe d'une API REST.",
  'Écris une fonction JavaScript concise qui inverse une chaîne de caractères.',
  'Donne 3 idées originales de recettes végétariennes en 5 ingrédients.'
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  examplePrompts = EXAMPLE_PROMPTS;

  prompt = '';
  useTemperature = false;
  temperature = 0.7;
  loading = false;
  errorMessage = '';
  lastResponses: ResponseCard[] = [];
  history: HistoryEntry[] = [];

  constructor(private openRouterService: OpenRouterService) {}

  get temperatureLabel(): string {
    if (this.temperature < 0.3) {
      return 'Précis et déterministe';
    }
    if (this.temperature < 0.9) {
      return 'Équilibré';
    }
    return 'Créatif et expressif';
  }

  useExamplePrompt(example: string): void {
    this.prompt = example;
  }

  onSubmit(): void {
    if (!this.prompt.trim() || this.loading) {
      return;
    }

    const temperature = this.useTemperature ? this.temperature : undefined;
    const currentPrompt = this.prompt.trim();

    this.loading = true;
    this.errorMessage = '';

    forkJoin([
      this.openRouterService.sendPrompt(currentPrompt, environment.openRouterApiKey, temperature),
      this.openRouterService.sendPrompt(currentPrompt, environment.openRouterApiKey, temperature)
    ]).subscribe({
      next: ([first, second]) => {
        const responses: ResponseCard[] = [first, second].map((res) => ({
          model: res.model,
          content: res.choices[0]?.message?.content ?? ''
        }));

        this.lastResponses = responses;
        this.history.unshift({
          timestamp: new Date(),
          prompt: currentPrompt,
          temperature,
          responses
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.error?.message || "Une erreur est survenue lors de l'appel à OpenRouter.";
        this.loading = false;
      }
    });
  }
}
