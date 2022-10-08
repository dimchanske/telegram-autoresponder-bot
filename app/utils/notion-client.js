export async function getQueries(notionClient, databaseId) {
  try {
    const response = await notionClient.databases.query({
      database_id: databaseId,
    });

    console.log('Config fetched!');

    return response.results
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
  } catch (error) {
    console.error(error);
  }
}
