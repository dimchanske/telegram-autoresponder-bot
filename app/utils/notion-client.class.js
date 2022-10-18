import { Client } from '@notionhq/client';

export class NotionClient {
  constructor(token, databaseId) {
    this.databaseId = databaseId;
    this.notionClient = new Client({ auth: process.env.NOTION_KEY });
    this.lastEditedMap = null;
  }

  async getConfig() {
    try {
      const response = await this.notionClient.databases.query({
        database_id: this.databaseId,
      });

      if (!response || !response.results) {
        return;
      }

      const lastEditedMapUpdated = response.results
        .filter(entry => entry.object === 'page')
        .reduce((acc, page) => {
          acc[page.id] = page.last_edited_time;
          return acc;
        }, {});

      let hasConfigChanged = false;

      if (!this.lastEditedMap) {
        this.lastEditedMap = lastEditedMapUpdated;
      } else {
        if (Object.keys(this.lastEditedMap).length !== Object.keys(lastEditedMapUpdated).length) {
          hasConfigChanged = true;
        } else {
          hasConfigChanged = Object.keys(lastEditedMapUpdated)
            .some(pageId => this.lastEditedMap[pageId] !== lastEditedMapUpdated[pageId]);
        }
      }

      if (hasConfigChanged) {
        this.lastEditedMap = lastEditedMapUpdated;
      }

      const queries = response.results
        .map(p => {
          const keySets = p.properties[process.env.NOTION_KEYS_COLUMN].rich_text;
          const response = p.properties[process.env.NOTION_RESPONSES_COLUMN].rich_text;

          if (!keySets || !keySets.length || !response || !response.length) {
            return;
          }

          return {
            keySets: keySets
              .reduce((acc, richText) => acc + richText.plain_text, '')
              .split('\n'),
            response: response
              .reduce((acc, richText) => acc + richText.plain_text, ''),
          }
        })
        .filter(Boolean);

      return {
        queries,
        hasConfigChanged,
      }
    } catch (error) {
      console.error(error);
    }
  }
}
