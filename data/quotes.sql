DROP TABLE IF EXISTS quote;
DROP TABLE IF EXISTS author;
DROP TABLE IF EXISTS user;

CREATE TABLE user
(
    user_id integer primary key autoincrement,
    user_name varchar not null,
    user_password varchar not null
);

create table author
(
    auth_id integer primary key AUTOINCREMENT,
    auth_firstname text,
    auth_lastname text not null,
    auth_picture text
);

create table quote
(
    quote_id integer primary key AUTOINCREMENT,
    quote_text text not null,
    auth_id integer references author(auth_id)
);

insert into author (auth_firstname, auth_lastname,auth_picture) values
('Sherlock', 'Holmes', 'holmes.jpeg'),
('George','Orwell','orwell.jpeg'),
('Rene','Descartes','descartes.webp'),
('Simone','Biles','biles.webp'),
(null,'Confucius','confucius.wbp');

insert into quote (quote_text,auth_id) values
('Elementary, my dear Watson',1),
('I think therefore I am',2),
('Big Brother is watching you',3),
('Practice creates confidence. Confidence empowers you',4),
('The best time to plant a tree was 20 years ago. The second best time is now',null),
('Everything has beauty, but not everyone can see',5),
('It does not matter how slowly you go as long as you do not stop',5);


INSERT INTO user(user_name,user_password) VALUES ('toto','$2b$10$D9H96iHFqk7q4YsdBxgP.uBeqFdfE0N/h3nR64oIuciuIfN8KaMRO');
