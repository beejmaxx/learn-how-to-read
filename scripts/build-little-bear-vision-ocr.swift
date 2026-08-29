#!/usr/bin/env swift

import AppKit
import Foundation
import Vision

struct Word: Codable {
    let text: String
    let x: Double
    let y: Double
    let w: Double
    let h: Double
}

struct BookWords: Codable {
    let width: Int
    let height: Int
    let pages: [String: [Word]]
}

let fileManager = FileManager.default
let scriptURL = URL(fileURLWithPath: CommandLine.arguments[0]).resolvingSymlinksInPath()
let root = scriptURL.deletingLastPathComponent().deletingLastPathComponent()
let pageDirectory = root.appendingPathComponent("books/little-bear/pages")
let output = root.appendingPathComponent("books/little-bear/words.json")
let pageWidth = 584.0
let pageHeight = 754.0
let wordPattern = try NSRegularExpression(pattern: #"[A-Za-z0-9]+(?:['’][A-Za-z]+)?|[—…]+"#)
var pages: [String: [Word]] = [:]

for page in 13...64 {
    let imageURL = pageDirectory.appendingPathComponent(String(format: "page-%03d.jpg", page))
    guard let image = NSImage(contentsOf: imageURL) else {
        fatalError("Could not read \(imageURL.path)")
    }
    var imageRect = NSRect(origin: .zero, size: image.size)
    guard let cgImage = image.cgImage(forProposedRect: &imageRect, context: nil, hints: nil) else {
        fatalError("Could not decode \(imageURL.path)")
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    request.recognitionLanguages = ["en-US"]
    request.minimumTextHeight = 0.012
    try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])

    var words: [Word] = []
    for observation in request.results ?? [] {
        guard let candidate = observation.topCandidates(1).first else { continue }
        let line = candidate.string
        let fullRange = NSRange(line.startIndex..<line.endIndex, in: line)
        for match in wordPattern.matches(in: line, range: fullRange) {
            guard let range = Range(match.range, in: line),
                  let box = try? candidate.boundingBox(for: range) else { continue }
            let rect = box.boundingBox
            var text = String(line[range])
            let x = rect.minX * pageWidth
            let y = (1.0 - rect.maxY) * pageHeight
            let width = rect.width * pageWidth
            let height = rect.height * pageHeight
            if text == "1" { text = "I" }
            if x < 25 || x + width > 560 || y < 26 || y > 710 || y + height > 727 || width <= 1 || height <= 1 || height > 80 { continue }
            words.append(Word(text: text, x: x, y: y, w: width, h: height))
        }
    }
    words.sort {
        if abs($0.y - $1.y) > 5 { return $0.y < $1.y }
        return $0.x < $1.x
    }
    pages[String(page)] = words
    print("page \(page): \(words.count) words")
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.sortedKeys]
let data = try encoder.encode(BookWords(width: Int(pageWidth), height: Int(pageHeight), pages: pages))
try data.write(to: output, options: .atomic)
print("Wrote \(output.path)")
