import { emptyDir, locateFixtures, rm, writeFile } from 'jest.helper'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { IFilePartItem } from '../src'
import { BigFileHelper, calcFilePartItemsBySize } from '../src'

describe('BigFileHelper', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.BigFileHelper')
  const encoding: BufferEncoding = 'utf8'
  const maxTargetFileSize = 1024
  const partCodePrefix = '.ghc-part'
  const fileHelper = new BigFileHelper({ partCodePrefix })

  const filepathA = path.join(workspaceDir, 'A.txt')
  const filepathB = path.join(workspaceDir, 'B.txt')
  const filepathC = path.join(workspaceDir, 'C.txt')
  const filepathD = path.join(workspaceDir, 'D.txt')
  const filepathE = path.join(workspaceDir, 'E.txt')
  const filepathF = path.join(workspaceDir, 'F.txt')
  const filepathG = path.join(workspaceDir, 'G.txt')

  const filepath2A = path.join(workspaceDir, '2A.txt')
  const filepath2B = path.join(workspaceDir, '2B.txt')
  const filepath2C = path.join(workspaceDir, '2C.txt')
  const filepath2D = path.join(workspaceDir, '2D.txt')
  const filepath2E = path.join(workspaceDir, '2E.txt')
  const filepath2F = path.join(workspaceDir, '2F.txt')
  const filepath2G = path.join(workspaceDir, '2G.txt')

  const contentA: string = 'Hello, A.'.repeat(350)
  const contentB = 'Hello, B.'.repeat(35)
  const contentC = 'Hello, C.'.repeat(750)
  const contentD = 'Hello, D.'.repeat(1350)
  const contentE = ''
  const contentF: string = readFileSync(locateFixtures('f.md'), encoding)
  const contentG: string = readFileSync(locateFixtures('g.md'), encoding)

  const partsA: IFilePartItem[] = calcFilePartItemsBySize(contentA.length, maxTargetFileSize)
  const partsB: IFilePartItem[] = calcFilePartItemsBySize(contentB.length, maxTargetFileSize)
  const partsC: IFilePartItem[] = calcFilePartItemsBySize(contentC.length, maxTargetFileSize)
  const partsD: IFilePartItem[] = calcFilePartItemsBySize(contentD.length, maxTargetFileSize)
  const partsE: IFilePartItem[] = calcFilePartItemsBySize(contentE.length, maxTargetFileSize)
  const partsF: IFilePartItem[] = calcFilePartItemsBySize(contentF.length, maxTargetFileSize)
  const partsG: IFilePartItem[] = calcFilePartItemsBySize(contentG.length, maxTargetFileSize)

  const partsAFilepaths: string[] = ['1', '2', '3', '4'].map(p => filepathA + partCodePrefix + p)
  const partsBFilepaths: string[] = [filepathB]
  const partsCFilepaths: string[] = ['1', '2', '3', '4', '5', '6', '7'].map(
    p => filepathC + partCodePrefix + p,
  )
  const partsDFilepaths: string[] = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
  ].map(p => filepathD + partCodePrefix + p)
  const partsEFilepaths: string[] = [filepathE]
  const partsFFilepaths: string[] = ['1', '2', '3', '4', '5', '6'].map(
    p => filepathF + partCodePrefix + p,
  )
  const partsGFilepaths: string[] = [filepathG]

  beforeEach(async () => {
    await emptyDir(workspaceDir)
    await writeFile(filepathA, contentA, encoding)
    await writeFile(filepathB, contentB, encoding)
    await writeFile(filepathC, contentC, encoding)
    await writeFile(filepathD, contentD, encoding)
    await writeFile(filepathE, contentE, encoding)
    await writeFile(filepathF, contentF, encoding)
    await writeFile(filepathG, contentG, encoding)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('calcPartFilepaths', () => {
    expect(fileHelper.calcPartFilepaths(filepathA, partsA)).toEqual(
      ['1', '2', '3', '4'].map(p => filepathA + partCodePrefix + p),
    )
    expect(fileHelper.calcPartFilepaths(filepathB, partsB)).toEqual([filepathB])
    expect(fileHelper.calcPartFilepaths(filepathC, partsC)).toEqual(
      ['1', '2', '3', '4', '5', '6', '7'].map(p => filepathC + partCodePrefix + p),
    )
    expect(fileHelper.calcPartFilepaths(filepathD, partsD)).toEqual(
      ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(
        p => filepathD + partCodePrefix + p,
      ),
    )
    expect(fileHelper.calcPartFilepaths(filepathE, partsE)).toEqual([filepathE])
    expect(fileHelper.calcPartFilepaths(filepathF, partsF)).toEqual(
      ['1', '2', '3', '4', '5', '6'].map(p => filepathF + partCodePrefix + p),
    )
    expect(fileHelper.calcPartFilepaths(filepathG, partsG)).toEqual([filepathG])
  })

  test('split', async () => {
    // A
    const partPathsA = await fileHelper.split(filepathA, partsA)
    expect(partPathsA).toEqual(partsAFilepaths)
    expect(partPathsA.every(fp => existsSync(fp))).toEqual(true)

    // B
    const partPathsB = await fileHelper.split(filepathB, partsB)
    expect(partPathsB).toEqual(partsBFilepaths)
    expect(partPathsB.every(fp => existsSync(fp))).toEqual(true)

    // C
    const partPathsC = await fileHelper.split(filepathC, partsC)
    expect(partPathsC).toEqual(partsCFilepaths)
    expect(partPathsC.every(fp => existsSync(fp))).toEqual(true)

    // D
    const partPathsD = await fileHelper.split(filepathD, partsD)
    expect(partPathsD).toEqual(partsDFilepaths)
    expect(partPathsD.every(fp => existsSync(fp))).toEqual(true)

    // E
    const partPathsE = await fileHelper.split(filepathE, partsE)
    expect(partPathsE).toEqual(partsEFilepaths)
    expect(partPathsE.every(fp => existsSync(fp))).toEqual(true)

    // F
    const partPathsF = await fileHelper.split(filepathF, partsF)
    expect(partPathsF).toEqual(partsFFilepaths)
    expect(partPathsF.every(fp => existsSync(fp))).toEqual(true)

    // G
    const partPathsG = await fileHelper.split(filepathG, partsG)
    expect(partPathsG).toEqual(partsGFilepaths)
    expect(partPathsG.every(fp => existsSync(fp))).toEqual(true)
  })

  test('merge', async () => {
    // A
    const partPathsA = await fileHelper.split(filepathA, partsA)
    expect(partPathsA).toEqual(partsAFilepaths)
    expect(partPathsA.every(fp => existsSync(fp))).toEqual(true)
    await fileHelper.merge(partPathsA, filepath2A)
    expect(readFileSync(filepath2A, encoding)).toEqual(contentA)

    // B
    const partPathsB = await fileHelper.split(filepathB, partsB)
    expect(partPathsB).toEqual(partsBFilepaths)
    expect(partPathsB.every(fp => existsSync(fp))).toEqual(true)
    await fileHelper.merge(partPathsB, filepath2B)
    expect(readFileSync(filepath2B, encoding)).toEqual(contentB)

    // C
    const partPathsC = await fileHelper.split(filepathC, partsC)
    expect(partPathsC).toEqual(partsCFilepaths)
    expect(partPathsC.every(fp => existsSync(fp))).toEqual(true)
    await fileHelper.merge(partPathsC, filepath2C)
    expect(readFileSync(filepath2C, encoding)).toEqual(contentC)

    // D
    const partPathsD = await fileHelper.split(filepathD, partsD)
    expect(partPathsD).toEqual(partsDFilepaths)
    expect(partPathsD.every(fp => existsSync(fp))).toEqual(true)
    await fileHelper.merge(partPathsD, filepath2D)
    expect(readFileSync(filepath2D, encoding)).toEqual(contentD)

    // E
    const partPathsE = await fileHelper.split(filepathE, partsE)
    expect(partPathsE).toEqual(partsEFilepaths)
    expect(partPathsE.every(fp => existsSync(fp))).toEqual(true)
    await fileHelper.merge(partPathsE, filepath2E)
    expect(readFileSync(filepath2E, encoding)).toEqual(contentE)

    // F
    const partPathsF = await fileHelper.split(filepathF, partsF)
    expect(partPathsF).toEqual(partsFFilepaths)
    expect(partPathsF.every(fp => existsSync(fp))).toEqual(true)
    await fileHelper.merge(partPathsF, filepath2F)
    expect(readFileSync(filepath2F, encoding)).toEqual(contentF)

    // G
    const partPathsG = await fileHelper.split(filepathG, partsG)
    expect(partPathsG).toEqual(partsGFilepaths)
    expect(partPathsG.every(fp => existsSync(fp))).toEqual(true)
    await fileHelper.merge(partPathsG, filepath2G)
    expect(readFileSync(filepath2G, encoding)).toEqual(contentG)
  })
})
