#!/usr/bin/env perl
use strict;
use warnings;
use utf8;

for my $key (sort keys %ENV) {
    print "$key\n";
    if (length($ENV{$key}) > 10) {
        next;
    }
    print "$ENV{$key}\n";
    print "### \n";
}
