from .calculator import add, multiply

def compute_expression(a, b, c):
    # Simulate: (a + b) * c
    return multiply(add(a, b), c)
