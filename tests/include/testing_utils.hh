#ifndef _BRESTPROG_TESTING_UTILS_HH
#define _BRESTPROG_TESTING_UTILS_HH

// We include this here to allow tests to #include program source
// inside a dedicated namespace without worrying about any #include's
// that the program itself contains.
#include <bits/stdc++.h>


// Utils
//
// These are some helper functions for this header, but they may also be
// useful for some tests.

// Splits a string on one of given characters.
std::vector<std::string> Split(const std::string s, const std::string& chars) {
  std::vector<std::string> result;

  size_t start = 0;
  for (;;) {
    size_t next_pos = s.find_first_of(chars, start);

    std::string part;
    if (next_pos != std::string::npos) {
      part = s.substr(start, next_pos - start);
    } else {
      part = s.substr(start);
    }

    result.push_back(part);

    if (next_pos != std::string::npos) {
      start = next_pos + 1;
    } else {
      break;
    }
  }

  return result;
}

// Repeats a string a given number of times.
std::string Repeat(const std::string& s,
                   size_t times,
                   const std::string& delimiter = "") {
  std::string result;
  result.reserve((s.length() + delimiter.length()) * times);
  for (size_t i = 0; i + 1 < times; i++) {
    result += s;
    result += delimiter;
  }

  if (times > 0) {
    result += s;
  }

  return std::move(result);
}

// Prints a range of numbers to a string (like "1 2 3 4 5").
template <typename T>
std::string RangeString(T first, T last, const std::string& delimiter = " ") {
  std::string result;
  for (T t = first; t < last; t++) {
    result += std::to_string(t);
    result += delimiter;
  }

  result += std::to_string(last);
  return std::move(result);
}

std::forward_list<std::string> _ConcatToList() {
  return {};
}

template <typename T, typename ...Rest>
std::forward_list<std::string> _ConcatToList(const T& t, Rest ...rest) {
  auto tail = _ConcatToList(rest...);
  tail.push_front(t);
  return std::move(tail);
}

// Converts all of its parameters to strings and concatenates them.
template <typename T, typename ...Rest>
std::string Concat(const T& t, Rest ...rest) {
  auto list = _ConcatToList(rest...);
  list.push_front(t);

  std::string result;
  for (auto& element: list) {
    result += std::move(element);
  }

  return std::move(result);
}

bool IsEmpty(const std::string& s) { return s == ""; }


// Debug printers
//
// Debug printers provide a single extensible interface for converting
// various values to strings. Most of the time you can get a nice string
// representation of `x` by just calling `Debug(x).print()`.
//
// If Debug isn't implemented for some type, you can add the implementation
// in a similar way to the ones below.

template <typename T, typename Enable = void>
struct Debug;

template <typename T>
Debug(T t) -> Debug<T>;

template <> struct Debug<std::string> {
  Debug(const std::string& s) : s(s) { }

  std::string print() {
    return std::string("\"") + s + "\"";
  }

private:
  const std::string& s;
};

template <typename T>
struct Debug<T, typename std::enable_if_t<std::is_integral_v<T>>> {
  Debug(const T& x) : x(x) { }

  std::string print() {
    return std::to_string(x);
  }

private:
  const T& x;
};

template <typename T>
struct Debug<std::vector<T>> {
  Debug(const std::vector<T>& v) : v(v) { }

  std::string print() {
    std::string result = "[";

    for (size_t i = 0; i + 1 < v.size(); i++) {
      result += Debug(v[i]).print();
      result += ',';
    }

    if (v.size()) {
      result += Debug(v.back()).print();
    }

    result += ']';

    return result;
  }

private:
  const std::vector<T>& v;
};

// Matches all types that have "debug" member function.
template <typename T>
struct Debug<T, std::void_t<decltype(&T::debug)>> {
  Debug(const T& t) : t(t) { }

  std::string print() {
    return t.debug();
  }
private:
  const T& t;
};


// Assertions

template <typename T>
void _AssertEq(const T& a, const T& b,
               const char *file, int line, const char *func) {
  if (!(a == b)) {
    std::cerr << file << ":" << line << ": " << func << ": Assertion failed!\n";
    std::cerr << Debug(a).print() << " != " << Debug(b).print() << std::endl;
    std::exit(1);
  }
}

template <typename Checker>
void _AssertMatches(const std::string& out, const Checker& checker,
                    const char *file, int line, const char *func) {
  if (!checker.matches(out)) {
    std::cerr << file << ":" << line << ": " << func << ": Assertion failed!\n";
    std::cerr << Debug(out).print() << " didn't match "
              << Debug(checker).print() << std::endl;
    std::exit(1);
  }
}

#define AssertEq(a, b) _AssertEq(a, b, __FILE__, __LINE__, __func__)
#define AssertMatches(out, c) _AssertMatches(out, c, __FILE__, __LINE__, __func__)


// A mock class that can be used to redirect I/O of a program
// that uses std::cin/std::cout.
//
// The typical way of using this class is to shadow cin/cout with
// a macro that resolves to a field of an instance of this class,
// then include the program source.
class MockIO {
public:
  std::istringstream& in() { return test_sin; }
  std::ostringstream& out() { return test_sout; }

  // Resets the input stream, filling it with given content.
  // Also clears the output stream, to prepare for the next program run.
  void SetInput(const std::string& input_string) {
    test_sin.str(input_string);
    test_sin.clear();

    test_sout.str("");
    test_sout.clear();
  }

  // Returns the output of the program.
  std::string GetOutput() {
    return test_sout.str();
  }

private:
  std::istringstream test_sin;
  std::ostringstream test_sout;
};


// Checkers
//
// A checker is a routine that compares the actual program output
// with the expected output, usually allowing some trivial mismatches.

// An output checker that compares the output with the expected output
// line-by-line, token-by-token. This allows trailing whitespace at
// the ends of the lines.
struct LiteralTokenChecker {
public:
  LiteralTokenChecker(const std::string& expected_output)
      : expected_output(expected_output) { }

  bool matches(const std::string& actual_output) const {
    auto actual_lines = Split(actual_output, "\n");
    auto expected_lines = Split(expected_output, "\n");

    auto [actual_it, expected_it] = std::mismatch(
        actual_lines.begin(), actual_lines.end(),
        expected_lines.begin(), expected_lines.end(),
        [](const auto& actual_line, const auto& expected_line) {
          auto actual_tokens = Split(actual_line, " \t");
          auto expected_tokens = Split(expected_line, " \t");

          auto [actual_it, expected_it] = std::mismatch(
              actual_tokens.begin(), actual_tokens.end(),
              expected_tokens.begin(), expected_tokens.end());

          return all_of(actual_it, actual_tokens.end(), IsEmpty)
              && all_of(expected_it, expected_tokens.end(), IsEmpty);
        });

    return all_of(actual_it, actual_lines.end(), IsEmpty)
        && all_of(expected_it, expected_lines.end(), IsEmpty);
  }

  std::string debug() const {
    return std::string(
        "LiteralTokenChecker[" + Debug(expected_output).print() + "]");
  }

private:
  std::string expected_output;
};


// Test routines

// Tests a program using given input and checker.
// main() should be wrapped in a function returning void
// that resets all used static variables.
template <typename Checker>
void _TestProgram(std::function<void()> program,
                  MockIO& io,
                  const std::string& input,
                  const Checker& checker,
                  const char *file,
                  int line,
                  const char *func) {
  io.SetInput(input);
  program();
  _AssertMatches(io.GetOutput(), checker, file, line, func);
}

#define TestProgram(program, io, input, checker) \
  _TestProgram(program, io, input, checker, __FILE__, __LINE__, __func__)

#endif
