import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCost,
  formatTimecode,
  formatSeconds,
  validateKeyframes,
  generateRandomSeed,
  prepareExtendVideoState,
  calculateBatchUpscaleCost,
  filterTakes,
  INITIAL_TAKES,
} from './fluxVideoUtils';
import { TimelineKeyframe } from '../types/flux';

test('calculateCost computes draft vs final costs accurately', () => {
  const draft5s = calculateCost(5, 'draft', false, 30);
  assert.equal(draft5s.dollars, 0.30);
  assert.ok(draft5s.credits > 0);
  assert.match(draft5s.formatted, /\$0\.30/);

  const final5s = calculateCost(5, 'final', false, 30);
  assert.equal(final5s.dollars, 2.50);
  assert.equal(final5s.credits, 625); // 2.50 / 0.004 = 625 credits
  assert.match(final5s.formatted, /\$2\.50/);
});

test('calculateCost scales with inference steps', () => {
  const normalSteps = calculateCost(5, 'final', false, 30);
  const highSteps = calculateCost(5, 'final', false, 50);
  assert.ok(highSteps.dollars > normalSteps.dollars);
});

test('formatTimecode outputs accurate MM:SS:FF at 24fps', () => {
  assert.equal(formatTimecode(0, 24), '00:00:00');
  assert.equal(formatTimecode(5.5, 24), '00:05:12'); // 0.5s * 24 = 12 frames
  assert.equal(formatTimecode(65.25, 24), '01:05:06'); // 65s = 1m 5s, 0.25 * 24 = 6 frames
});

test('formatSeconds outputs standard MM:SS', () => {
  assert.equal(formatSeconds(0), '00:00');
  assert.equal(formatSeconds(9), '00:09');
  assert.equal(formatSeconds(125), '02:05');
});

test('validateKeyframes clamps timestamps, limits to 10, and sorts ascending', () => {
  const input: TimelineKeyframe[] = [
    { id: '3', timeSeconds: 15, imageUrl: 'img3' },
    { id: '1', timeSeconds: -2, imageUrl: 'img1' },
    { id: '2', timeSeconds: 4.23, imageUrl: 'img2' },
  ];

  const duration = 10;
  const result = validateKeyframes(input, duration);

  assert.equal(result.length, 3);
  assert.equal(result[0].id, '1');
  assert.equal(result[0].timeSeconds, 0); // clamped from -2
  assert.equal(result[1].id, '2');
  assert.equal(result[1].timeSeconds, 4.2);
  assert.equal(result[2].id, '3');
  assert.equal(result[2].timeSeconds, 10); // clamped to duration 10
});

test('generateRandomSeed returns a valid positive integer seed', () => {
  const seed = generateRandomSeed();
  assert.ok(Number.isInteger(seed));
  assert.ok(seed >= 100000);
});

test('prepareExtendVideoState correctly loads last frame into start slot', () => {
  const sampleTake = INITIAL_TAKES[0];
  const extendState = prepareExtendVideoState(sampleTake);

  assert.equal(extendState.workflowMode, 'video_extend');
  assert.equal(extendState.startFrameUrl, sampleTake.posterUrl);
  assert.equal(extendState.sourceVideoUrl, sampleTake.videoUrl);
  assert.ok(extendState.prompt.includes(sampleTake.prompt));
});

test('calculateBatchUpscaleCost computes totals and estimates correctly', () => {
  const batch3_1080p = calculateBatchUpscaleCost(3, '1080p');
  assert.equal(batch3_1080p.dollars, 2.25); // 3 * 0.75
  assert.equal(batch3_1080p.estimatedSeconds, 9); // 3 * 3s
  assert.ok(batch3_1080p.credits > 0);
  assert.match(batch3_1080p.formatted, /\$2\.25/);

  const batch2_4K = calculateBatchUpscaleCost(2, '4K');
  assert.equal(batch2_4K.dollars, 2.40); // 2 * 1.20
  assert.equal(batch2_4K.estimatedSeconds, 10); // 2 * 5s
  assert.match(batch2_4K.formatted, /\$2\.40/);

  const batch0 = calculateBatchUpscaleCost(0, '1080p');
  assert.equal(batch0.dollars, 0);
  assert.equal(batch0.credits, 0);
  assert.equal(batch0.estimatedSeconds, 0);
});

test('filterTakes filters by favorites and search text accurately', () => {
  const allTakes = INITIAL_TAKES;
  const favOnly = filterTakes(allTakes, 'favorites');
  assert.ok(favOnly.length > 0);
  assert.ok(favOnly.every((t) => t.isFavorite === true));
  assert.ok(favOnly.length <= allTakes.length);

  const searchCourier = filterTakes(allTakes, 'all', 'Courier');
  assert.equal(searchCourier.length, 1);
  assert.equal(searchCourier[0].id, 'take-001');

  const searchResolution = filterTakes(allTakes, 'all', '1080p');
  assert.ok(searchResolution.some((t) => t.resolution === '1080p'));
});

