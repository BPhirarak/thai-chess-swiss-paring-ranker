import { Player, Round, Ranking, BuchholzMethod } from '../types';

const getPlayer = (id: string, players: Player[]): Player | undefined => players.find(p => p.id === id);

export const calculateRankings = (players: Player[], rounds: Round[], buchholzMethod: BuchholzMethod): Ranking[] => {
    if (players.length === 0) return [];

    // Step 1: Aggregate scores, wins, draws, and opponent results for each player
    const playerStats = new Map<string, {
        score: number;
        wins: number;
        draws: number;
        opponentResults: Map<string, 1 | 0.5 | 0>; // opponentId -> result (1=win, 0.5=draw, 0=loss)
    }>();

    players.forEach(player => {
        playerStats.set(player.id, {
            score: 0,
            wins: 0,
            draws: 0,
            opponentResults: new Map(),
        });
    });

    rounds.forEach(round => {
        round.matches.forEach(match => {
            const { whitePlayerId, blackPlayerId, whiteResult } = match;

            if (whitePlayerId && whiteResult === 'bye') {
                const stats = playerStats.get(whitePlayerId)!;
                stats.score += 1;
                stats.wins += 1; // A bye counts as a 1-0 win
                return;
            }
            
            if (whitePlayerId && blackPlayerId && whiteResult !== '') {
                const whiteStats = playerStats.get(whitePlayerId)!;
                const blackStats = playerStats.get(blackPlayerId)!;

                const resultNum = parseFloat(String(whiteResult));

                if (resultNum === 1) { // White wins
                    whiteStats.score += 1;
                    whiteStats.wins += 1;
                    whiteStats.opponentResults.set(blackPlayerId, 1);
                    blackStats.opponentResults.set(whitePlayerId, 0);
                } else if (resultNum === 0.5) { // Draw
                    whiteStats.score += 0.5;
                    whiteStats.draws += 1;
                    whiteStats.opponentResults.set(blackPlayerId, 0.5);
                    blackStats.score += 0.5;
                    blackStats.draws += 1;
                    blackStats.opponentResults.set(whitePlayerId, 0.5);
                } else if (resultNum === 0) { // Black wins
                    blackStats.score += 1;
                    blackStats.wins += 1;
                    blackStats.opponentResults.set(whitePlayerId, 1);
                    whiteStats.opponentResults.set(blackPlayerId, 0);
                }
            }
        });
    });
    
    // Step 2: Calculate tie-breakers now that all final scores are known
    const rankingsWithTiebreakers: Omit<Ranking, 'position' | 'name' | 'school'>[] = [];

    players.forEach(player => {
        const stats = playerStats.get(player.id)!;
        
        const opponentIds = Array.from(stats.opponentResults.keys());
        const opponentScores = opponentIds.map(id => playerStats.get(id)!.score);

        // Buchholz: Sum of opponents' scores. Can be 'full' or 'cut-1'.
        let buchholz = 0;
        if (opponentScores.length > 0) {
            const sum = opponentScores.reduce((acc, score) => acc + score, 0);
            if (buchholzMethod === 'cut-1' && opponentScores.length > 1) {
                 const minScore = Math.min(...opponentScores);
                 buchholz = sum - minScore;
            } else {
                buchholz = sum; // Full Buchholz or only one opponent
            }
        }
        
        // Sonneborn-Berger: Sum of scores of opponents beaten + half sum of scores of opponents drawn with.
        let sbgr = 0;
        stats.opponentResults.forEach((result, opponentId) => {
            const opponentScore = playerStats.get(opponentId)!.score;
            if (result === 1) { // Win
                sbgr += opponentScore;
            } else if (result === 0.5) { // Draw
                sbgr += 0.5 * opponentScore;
            }
        });

        rankingsWithTiebreakers.push({
            playerId: player.id,
            score: stats.score,
            wins: stats.wins,
            draws: stats.draws,
            de: 0, // Direct Encounter not implemented.
            buchholz,
            sbgr,
        });
    });

    // Step 3: Sort the rankings based on the specified tie-break order
    rankingsWithTiebreakers.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        // DE would go here if implemented
        if (a.buchholz !== b.buchholz) return b.buchholz - a.buchholz;
        if (a.sbgr !== b.sbgr) return b.sbgr - a.sbgr;
        if (a.wins !== b.wins) return b.wins - a.wins;
        // Final tie-break by name
        const playerA = getPlayer(a.playerId, players);
        const playerB = getPlayer(b.playerId, players);
        return playerA && playerB ? playerA.name.localeCompare(playerB.name, 'th') : 0;
    });

    // Step 4: Map to the final Ranking structure, adding position and player info
    const finalRankings: Ranking[] = rankingsWithTiebreakers.map((stat, index) => {
        const player = getPlayer(stat.playerId, players)!;
        return {
            ...stat,
            position: 0, // Placeholder, will be set below
            name: player.name,
            school: player.school,
        };
    });

    // Step 5: Assign final positions, handling ties correctly
    if (finalRankings.length > 0) {
        finalRankings[0].position = 1;
        for (let i = 1; i < finalRankings.length; i++) {
            const prev = finalRankings[i - 1];
            const curr = finalRankings[i];
            // Check if current player is tied with the previous one
            if (curr.score === prev.score && curr.buchholz === prev.buchholz && curr.sbgr === prev.sbgr && curr.wins === prev.wins) {
                curr.position = prev.position;
            } else {
                curr.position = i + 1;
            }
        }
    }

    return finalRankings;
};
