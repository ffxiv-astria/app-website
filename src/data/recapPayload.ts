export const RECAP_PAYLOAD_SCHEMA_VERSION = 1;

export type RecapMetricTone = 'teal' | 'gold' | 'rose' | 'green' | 'violet';

export type RecapMetric = {
	label: string;
	value: string;
	note: string;
	tone?: RecapMetricTone;
};

export type RecapSlideKind =
	| 'zero-page'
	| 'cover'
	| 'overview'
	| 'first-aether'
	| 'last-aether'
	| 'route-map'
	| 'destination'
	| 'character'
	| 'time'
	| 'late-night'
	| 'chocobo-rush'
	| 'quiet-window'
	| 'stay'
	| 'return'
	| 'official-hints'
	| 'button-habit'
	| 'roast'
	| 'easter-echo'
	| 'current-status'
	| 'comparison'
	| 'data-coverage'
	| 'debug-check'
	| 'title-wall'
	| 'share';

export type RecapSlide = {
	id: string;
	kind: RecapSlideKind;
	title: string;
	kicker: string;
	body: string;
	metrics: RecapMetric[];
	footnote?: string;
	chartLabels?: string[];
	chartValues?: number[];
	tags?: string[];
	optional?: boolean;
	priority?: number;
	triggerReason?: string;
	emptyBehavior?: 'hide' | 'show-empty' | 'show-muted';
};

export type RecapSummary = {
	totalOrders: number;
	departureAttempts: number;
	successfulDepartures: number;
	completedOrders: number;
	activeReturns: number;
	autoReturns: number;
	stillAway: number;
	executingOrders: number;
	failedOrders: number;
	activeDays: number;
	activeMonths: number;
	characterCount: number;
	subAccountCount: number;
	sourceServerCount: number;
	targetServerCount: number;
	targetAreaCount: number;
	precheckFailures: number;
	topDestination: string;
	topDestinationShare: string;
	topArea: string;
	topRoute: string;
	homeServer: string;
	chocoboRushHits: number;
	longestQuietDays: number;
	firstOrderText: string;
	lastOrderText: string;
	mostActiveMonth: string;
	mostActiveWeekday: string;
	mostActiveHour: string;
	latestDepartureText: string;
	densestTravelDayText: string;
	longestActiveStreakText: string;
	longestStayText: string;
	fastestReturnText: string;
	comparisonText: string;
	freeTransfer2019Text: string;
	annualTitle: string;
};

export type RecapShareCard = {
	title: string;
	copy: string;
	highlights: string[];
	variant?: 'standard' | 'chocobo-rush' | 'zero-page' | 'gatekeeper' | 'quiet-window';
};

export type RecapEmptyState = {
	title: string;
	body: string;
	actionLabel: string;
};

export type RecapPayload = {
	schemaVersion: typeof RECAP_PAYLOAD_SCHEMA_VERSION;
	source: 'demo' | 'app';
	brand: string;
	year: string;
	rangeText: string;
	lastSyncedAt: string;
	isFullHistorySynced: boolean;
	title: string;
	privacyNote: string;
	summary: RecapSummary;
	shareCard: RecapShareCard;
	emptyState: RecapEmptyState;
	slides: RecapSlide[];
};
