/**
 * Utility functions for fuzzy name matching between participant names and sentiment stakeholder names
 */

/**
 * Finds the best matching sentiment stakeholder for a given participant name
 * @param participantName - The full participant name (e.g., "Kunta Kinteh Island & Museum...")
 * @param stakeholders - Array of sentiment stakeholders
 * @returns The matching stakeholder object or null
 */
export function findMatchingSentimentStakeholder(
  participantName: string,
  stakeholders: any[]
): any | null {
  if (!participantName || !stakeholders || stakeholders.length === 0) return null;

  // Normalize the participant name: convert to lowercase
  const normalizedParticipant = participantName.toLowerCase().trim();

  // Find all potential matches and score them
  const matches = stakeholders
    .map(stakeholder => {
      const normalizedStakeholder = stakeholder.stakeholder_name
        .replace(/_/g, ' ')
        .toLowerCase()
        .trim();
      
      let score = 0;

      // Exact match gets highest score
      if (normalizedParticipant === normalizedStakeholder) {
        score = 1000;
      }
      // Participant starts with stakeholder name
      else if (normalizedParticipant.startsWith(normalizedStakeholder)) {
        score = 900;
      }
      // Participant contains stakeholder name
      else if (normalizedParticipant.includes(normalizedStakeholder)) {
        score = 800;
      }
      // Stakeholder name contained in participant (less common)
      else if (normalizedStakeholder.includes(normalizedParticipant)) {
        score = 700;
      }
      // Check if all significant words from stakeholder are in participant
      else {
        const stakeholderWords = normalizedStakeholder.split(' ').filter(w => w.length > 2);
        const participantWords = normalizedParticipant.split(' ').filter(w => w.length > 2);
        const matchingWords = stakeholderWords.filter(word =>
          participantWords.some(pWord => pWord.includes(word) || word.includes(pWord))
        );

        if (matchingWords.length === stakeholderWords.length && stakeholderWords.length > 0) {
          score = 600;
        }
      }

      // Prefer longer stakeholder names when scores are similar (more specific matches)
      if (score > 0) {
        score += stakeholder.stakeholder_name.length * 0.1;
      }

      return { stakeholder, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  // Return the best match if any
  return matches.length > 0 ? matches[0].stakeholder : null;
}

/**
 * Finds the best matching participant name for a given sentiment stakeholder name
 * @param stakeholderName - The sentiment stakeholder name (e.g., "kunta_kinteh_island")
 * @param participants - Array of participants with name property
 * @returns The matching participant name or null
 */
export function findMatchingParticipantName(
  stakeholderName: string,
  participants: Array<{ name: string }>
): string | null {
  if (!participants || !stakeholderName) return null;

  // Normalize the stakeholder name: remove underscores, convert to lowercase
  const normalizedStakeholder = stakeholderName.replace(/_/g, ' ').toLowerCase().trim();

  // Find all potential matches and score them
  const matches = participants
    .map(p => {
      const normalizedParticipant = p.name.toLowerCase().trim();
      let score = 0;

      // Exact match gets highest score
      if (normalizedParticipant === normalizedStakeholder) {
        score = 1000;
      }
      // Participant starts with stakeholder name (e.g., "kunta kinteh island" matches "kunta kinteh island & museum...")
      else if (normalizedParticipant.startsWith(normalizedStakeholder)) {
        score = 900;
      }
      // Stakeholder contained in participant name
      else if (normalizedParticipant.includes(normalizedStakeholder)) {
        score = 800;
      }
      // Participant name contained in stakeholder (less common)
      else if (normalizedStakeholder.includes(normalizedParticipant)) {
        score = 700;
      }
      // Check if all significant words from stakeholder are in participant
      else {
        const stakeholderWords = normalizedStakeholder.split(' ').filter(w => w.length > 2);
        const participantWords = normalizedParticipant.split(' ').filter(w => w.length > 2);
        const matchingWords = stakeholderWords.filter(word =>
          participantWords.some(pWord => pWord.includes(word) || word.includes(pWord))
        );

        if (matchingWords.length === stakeholderWords.length && stakeholderWords.length > 0) {
          score = 600;
        }
      }

      // Prefer longer participant names when scores are similar (more specific matches)
      if (score > 0) {
        score += p.name.length * 0.1;
      }

      return { participant: p, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  // Return the best match if any
  return matches.length > 0 ? matches[0].participant.name : null;
}

