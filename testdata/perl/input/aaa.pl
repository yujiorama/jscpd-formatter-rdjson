#!/usr/bin/env perl
use strict;
use warnings;
use utf8;

for my $key (sort keys %ENV) {
    print "$key\n";
    print "$ENV{$key}\n";
    print "### \n";
}
