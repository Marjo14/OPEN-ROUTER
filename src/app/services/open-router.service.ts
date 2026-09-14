import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private http: HttpClient) {}

  sendPrompt(prompt: string, apiKey: string, temperature?: number): Observable<OpenRouterResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });

    const body: Record<string, unknown> = {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }]
    };

    if (temperature !== undefined) {
      body['temperature'] = temperature;
    }

    return this.http.post<OpenRouterResponse>(this.apiUrl, body, { headers });
  }
}