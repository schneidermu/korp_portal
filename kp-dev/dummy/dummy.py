import random

from dummy import news
from dummy.polls import PollsGen
from dummy.users import UsersGen

print("""
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
""")

random.seed(37)

news.gen()

polls_data = PollsGen()
users_data = UsersGen()

polls_data.print()
users_data.print()
