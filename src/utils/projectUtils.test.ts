import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_PROJECTS,
  createNewProject,
  duplicateProject,
  updateProjectInList,
  filterProjects,
} from './projectUtils';

test('INITIAL_PROJECTS has valid projects with takes and params', () => {
  assert.ok(INITIAL_PROJECTS.length >= 3);
  const p1 = INITIAL_PROJECTS[0];
  assert.ok(p1.id);
  assert.ok(p1.title);
  assert.ok(p1.takes.length > 0);
  assert.ok(p1.params.prompt);
});

test('createNewProject initializes with clean defaults', () => {
  const p = createNewProject('My Test Movie', { duration: 10, aspectRatio: '9:16' }, 'Commercials');
  assert.equal(p.title, 'My Test Movie');
  assert.equal(p.folder, 'Commercials');
  assert.equal(p.params.duration, 10);
  assert.equal(p.params.aspectRatio, '9:16');
  assert.equal(p.takes.length, 0);
  assert.ok(p.id.startsWith('proj-'));
});

test('duplicateProject creates a distinct copy with new ID and cloned takes', () => {
  const source = INITIAL_PROJECTS[0];
  const copy = duplicateProject(source);
  assert.notEqual(copy.id, source.id);
  assert.ok(copy.title.includes('(Copy)'));
  assert.equal(copy.takes.length, source.takes.length);
  if (copy.takes.length > 0) {
    assert.notEqual(copy.takes[0].id, source.takes[0].id);
  }
});

test('updateProjectInList updates in place and changes updatedAt', () => {
  const initialList = [...INITIAL_PROJECTS];
  const target = initialList[0];
  const updated = {
    ...target,
    title: 'Renamed Project',
  };

  const result = updateProjectInList(initialList, updated);
  assert.equal(result.length, initialList.length);
  assert.equal(result[0].title, 'Renamed Project');
  assert.ok(result[0].updatedAt >= target.updatedAt);
});

test('filterProjects filters by folder and search term', () => {
  const list = INITIAL_PROJECTS;
  const filteredFolder = filterProjects(list, 'Commercials');
  assert.ok(filteredFolder.length > 0);
  assert.ok(filteredFolder.every((p) => p.folder === 'Commercials'));

  const searched = filterProjects(list, 'all', 'Cyberpunk');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 'proj-001');
});
