.open vocab.db

.separator \t \n

BEGIN;

CREATE TABLE pinv_tab(
  word TEXT COLLATE NOCASE,
  mark TEXT,
  pinv TEXT,
  uuid TEXT,
  time INTEGER,
  UNIQUE (word, mark) ON CONFLICT IGNORE
);

.import han.txt pinv_tab
.import yue.txt pinv_tab

CREATE TABLE pron_tab(
  word TEXT,
  mark TEXT,
  pronuk TEXT,
  pronus TEXT,
  uuid TEXT,
  time INTEGER,
  UNIQUE (word, mark) ON CONFLICT IGNORE
);

.import eng.txt pron_tab

CREATE INDEX pron_idx ON pron_tab(
  word COLLATE NOCASE
);

CREATE TABLE mean_tab(
  word TEXT,
  mark TEXT,
  uuid TEXT,
  mean TEXT,
  time INTEGER,
  UNIQUE (word, mark, uuid) ON CONFLICT REPLACE
);
.import mean.txt mean_tab

CREATE INDEX mean_idx ON mean_tab(uuid) WHERE length(uuid);

CREATE TABLE user_tab(
  username TEXT,
  password TEXT,
  useruuid TEXT,
  jointime INTEGER,
  lasttime INTEGER,
  UNIQUE (username) ON CONFLICT IGNORE
);

CREATE INDEX user_idx ON user_tab(useruuid);


CREATE TABLE hist_tab(
  uuid TEXT,
  word TEXT,
  info TEXT,
  flag INTEGER,
  freq INTEGER,
  time INTEGER,
  UNIQUE (uuid, word) ON CONFLICT IGNORE
);

CREATE TABLE flag_tab(
  word TEXT,
  info TEXT,
  flag INTEGER,
  UNIQUE (word) ON CONFLICT REPLACE
);


CREATE TABLE note_tab(
  uuid TEXT,
  note TEXT COLLATE NOCASE,
  furl TEXT COLLATE NOCASE,
  time INTEGER,
  UNIQUE (uuid, note) ON CONFLICT REPLACE
);

COMMIT;
