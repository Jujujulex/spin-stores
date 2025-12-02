import { NextRequest, NextResponse } from 'next/server';
import { getPointsLeaderboard } from '@/lib/gamification/points';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const leaderboard = await getPointsLeaderboard(limit);

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
