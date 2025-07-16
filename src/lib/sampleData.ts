
const classesJson = require('../../api_samples/classes.json');
const branchesJson = require('../../api_samples/branches.json');
const productsJson = require('../../api_samples/products.json');
const seasonsJson = require('../../api_samples/seasons.json');
const episodesJson = require('../../api_samples/episodes.json');
const testsJson = require('../../api_samples/tests.json');
const teachersJson = require('../../api_samples/teachers_if_applicable.json');

export const classesSample = (classesJson as any).result;
export const branchesSample = (branchesJson as any).result;
export const productsSample = (productsJson as any).result;
export const seasonsSample = (seasonsJson as any).result;
export const episodesSample = (episodesJson as any).result;
export const testsSample = (testsJson as any).result;
export const teachersSample = (teachersJson as any).result; 