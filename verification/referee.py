"""
CheckiOReferee is a base referee for checking you code.
    arguments:
        tests -- the dict contains tests in the specific structure.
            You can find an example in tests.py.
        cover_code -- is a wrapper for the user function and additional operations before give data
            in the user function. You can use some predefined codes from checkio.referee.cover_codes
        checker -- is replacement for the default checking of an user function result. If given, then
            instead simple "==" will be using the checker function which return tuple with result
            (false or true) and some additional info (some message).
            You can use some predefined codes from checkio.referee.checkers
        add_allowed_modules -- additional module which will be allowed for your task.
        add_close_builtins -- some closed builtin words, as example, if you want, you can close "eval"
        remove_allowed_modules -- close standard library modules, as example "math"
checkio.referee.checkers
    checkers.float_comparison -- Checking function fabric for check result with float numbers.
        Syntax: checkers.float_comparison(digits) -- where "digits" is a quantity of significant
            digits after coma.
checkio.referee.cover_codes
    cover_codes.unwrap_args -- Your "input" from test can be given as a list. if you want unwrap this
        before user function calling, then using this function. For example: if your test's input
        is [2, 2] and you use this cover_code, then user function will be called as checkio(2, 2)
    cover_codes.unwrap_kwargs -- the same as unwrap_kwargs, but unwrap dict.
"""

from checkio import api
from checkio.signals import ON_CONNECT
from checkio.referees.io import CheckiOReferee
#from checkio.referees import cover_codes

from tests import TESTS

def checker(answer, result):
    grid, directions = answer
    nb_rows, nb_cols = len(grid), len(grid[0])
    N = nb_rows * nb_cols
    # check types
    if not (isinstance(result, (list, tuple)) and
            all(isinstance(row, (list, tuple)) and
                all(isinstance(n, int) for n in row) for row in result)):
        return False, ("Result should be a list/tuple of "
                       "lists/tuples of integers.")
    # check sizes and content compatibility
    if not (len(result) == nb_rows and
            all(len(row) == nb_cols for row in result)):
        return False, "You should not have changed sizes."
    if not all(user_n == n for row, user_row in zip(grid, result)
                           for n, user_n in zip(row, user_row) if n):
        return False, "You should not have changed non-zero numbers."
    # check if numbers describe range(1, N + 1)
    numbers = sorted(n for row in result for n in row)
    if 0 in numbers:
        return False, "Still a zero in the grid."
    if numbers != list(range(1, N + 1)):
        return False, ("Numbers in the grid should be "
                       f"integers between 1 and {N}.")
    path = {n: (i, j) for i, row in enumerate(result)
                      for j, n in enumerate(row)}
    vectors = {'NW': (-1, -1), 'N': (-1, 0), 'NE': (-1, 1),
               'W' : ( 0, -1),               'E' : ( 0, 1),
               'SW': ( 1, -1), 'S': ( 1, 0), 'SE': ( 1, 1)}
    same_direction = lambda x1, y1, x2, y2: (x1 * y2 == x2 * y1 and
                                             x1 * x2 >= 0 and y1 * y2 >= 0)
    for n in range(1, N):
        (i, j), (x, y) = path[n], path[n + 1]
        vector, nwse = (x - i, y - j), directions[i][j]
        if not same_direction(*vector, *vectors[nwse]):
            return False, (f"Arrow from {n} to {n + 1}: "
                           f"direction at {(i, j)} is not respected.")
    return True, "Great!"


cover = '''
def cover(func, data):
    return func(data[0], tuple(map(tuple, data[1])))
'''

api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests = TESTS,
        checker = checker,
        function_name = {
            'python': 'signpost',
            #'js': 'signpost',
            },
        cover_code = {
            'python-3': cover,
            #'js-node': 
            }
        ).on_ready
)
