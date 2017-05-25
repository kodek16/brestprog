#!/usr/bin/env python

import html
import re
import subprocess

from sys import stdin
from pathlib import Path

def main():
    '''Run tests and embed code listings into an HTML page.

    Usage: ./utils/lection-processor.py
    Working directory should be project root.
    Raw HTML will be read from stdin.
    Compiled page HTML will be written to stdout.
    Test runner logs will be written to stderr.
    '''

    contents = stdin.readlines()

    directive_re = re.compile(r'<!--@\s*(.+?)\s*@-->')

    def process_line(line):
        '''Processes directive or returns line verbatim if there isn't any.'''
        match = directive_re.search(line)
        if match is None:
            return line
        else:
            components = match.group(1).split(':')
            directive, arguments = components[0], components[1:]

            if directive == 'listing':
                assert len(arguments) == 1, 'Invalid directive: %s' % match.string
                return load_listing(arguments[0])
            else:
                print('Unknown directive: %s' % match.string)
                exit(1)

    processed_contents = ''.join([process_line(l) for l in contents])
    print(processed_contents)

def load_listing(path):
    '''Test listing and construct HTML layout from it.'''

    directory = Path('.') / 'listings' / path

    html_template = '''<div class="listing">
        <ul class="nav nav-pills" role="tablist">
            %s
        </ul>
        <div class="tab-content">
            %s
        </div>
    </div>'''

    nav_button_template = '''<li role="presentation">
        <a href="javascript:;" role="tab">%s</a>
    </li>'''

    tab_template = '''<div role="tabpanel" class="tab-pane">
        <pre><code class="language-%s line-numbers">%s</code></pre>
    </div>'''

    nav_buttons_html, tabs_html = '', ''

    for cpp_listing in directory.glob('*.cc'):
        absolute_path = str(cpp_listing.absolute())

        compile_cmd = ['g++',
                       '-DTESTING',
                       '-I%s' % str(Path('utils').absolute()),
                       '-o',
                       '/tmp/brestprog.test',
                       absolute_path]

        compile_exit_code = subprocess.call(compile_cmd)
        assert compile_exit_code == 0, 'Couldn\'t compile listing %s, exiting.' % absolute_path

        test_exit_code = subprocess.call(['/tmp/brestprog.test'])
        assert test_exit_code == 0, 'Tests for listing %s failed.' % absolute_path

        with cpp_listing.open() as listing_file:
            raw_source = listing_file.read()
            source = preprocess_cpp_listing(raw_source)

            nav_buttons_html += nav_button_template % 'C++'
            tabs_html += tab_template % ('cpp', source)

    return html_template % (nav_buttons_html, tabs_html)

def preprocess_cpp_listing(raw_source):
    '''Processes listing directives and escapes HTML special characters.'''
    lines = raw_source.split('\n')
    processed_lines = []

    hide = False

    for line in lines:
        if line.strip() == '/*@ hide @*/':
            hide = True

        if not hide:
            processed_lines.append(line)

        if line.strip() == '/*@ end @*/':
            hide = False

    while processed_lines[-1] == '':
        processed_lines.pop()

    source = '\n'.join(processed_lines)

    return html.escape(source)

if __name__ == '__main__':
    main()
