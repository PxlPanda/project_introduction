def iterate_over(inp_values: list, n: int):
    for elem in inp_values:
        yield elem ** n
        yield n ** elem
print(list(iterate_over([1, 2, 3, 4, 5], 3)))
