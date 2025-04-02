from src.service import compute_expression

def test_compute_expression():
    result = compute_expression(2, 3, 4)  # (2 + 3) * 4 = 20
    assert result == 20
