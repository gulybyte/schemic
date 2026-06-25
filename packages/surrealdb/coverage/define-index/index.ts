import { coverage } from "../_kit";
import base from "./base";
import comment from "./comment";
import composite from "./composite";
import count from "./count";
import diskann from "./diskann";
import diskannTuned from "./diskann-tuned";
import fulltextAnalyzer from "./fulltext-analyzer";
import fulltextBm25 from "./fulltext-bm25";
import fulltextHighlights from "./fulltext-highlights";
import hnsw from "./hnsw";
import hnswTuned from "./hnsw-tuned";
import ifNotExists from "./if-not-exists";
import overwrite from "./overwrite";
import unique from "./unique";

/** Every permutation of the `DEFINE INDEX` statement, in grammar order. Indexes are authored on a table
 *  (`.index(name, fields, spec?)`) or inline on a field (`.$unique()`/`.$index()`/`.$fulltext()`/
 *  `.$hnsw()`/`.$diskann()`), so each item is a minimal table whose emit pins the `DEFINE INDEX …` line. */
export const defineIndexCoverage = coverage("DEFINE INDEX", [
  // [ OVERWRITE | IF NOT EXISTS ] @name ON [ TABLE ] @table [ FIELDS | COLUMNS ] @fields
  base,
  overwrite,
  ifNotExists,
  // [ FIELDS | COLUMNS ] @fields (composite)
  composite,
  // UNIQUE
  unique,
  // FULLTEXT ANALYZER @analyzer [ BM25 [(@k1, @b)] ] [ HIGHLIGHTS ]
  fulltextAnalyzer,
  fulltextBm25,
  fulltextHighlights,
  // HNSW DIMENSION @dimension [ TYPE | DIST | EFC | M ]
  hnsw,
  hnswTuned,
  // DISKANN DIMENSION @dimension [ TYPE | DIST | DEGREE | L_BUILD | ALPHA ]
  diskann,
  diskannTuned,
  // COUNT
  count,
  // COMMENT @string
  comment,
]);
