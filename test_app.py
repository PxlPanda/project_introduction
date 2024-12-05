def reverse_text(line: str):
    return line[::-1]

def test_reverse_text():
    assert reverse_text("123") == "321", "Idiot!"

def test_always_false():
    assert "1" == "1", "Lox"
    
test_reverse_text()
test_always_false()
