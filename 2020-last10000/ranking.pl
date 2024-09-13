use strict;
use warnings;
use utf8;

my $userName;
my $levelId;
my %levelsUser;
my %levelsNum;
my %userMinNum;

my $style = shift @ARGV;

{
    my $input = "input\\discord-log.txt";
    open F, "<$input" or die;
    binmode F, ":utf8";

    while(<F>) {
        chomp;

        next if (m/^$/);

        if (m/^(.*?) has cleared ".* \((...-...-...)\)! The clear rate is now \d+\/(\d+)+\. This is their (\d+)/) {
            $userName = $1;
            $levelId = $2;
            next;
        }

        if (m/^There are (\d*),?(\d+) uncleared 2020 courses!/) {
            my $num = $1 . $2;

            if (defined $levelsUser{$levelId}) {
                if ($levelsUser{$levelId} ne $userName) {
                    print STDERR "There are multi result for one level ($levelId) and their user name of the clears aren't same. $levelsUser{$levelId} ne $userName\n";
                }
                if (defined $levelsNum{$levelId} && $levelsNum{$levelId} != $num) {
                    print STDERR "There are multi result for one level ($levelId): $levelsNum{$levelId} != $num\n";
                }
            } else {
                $levelsUser{$levelId} = $userName;
                $levelsNum{$levelId} = $num;
            }
        }

        $userName = '';
        $levelId = '';
    }

    close F;
}

my %userNum;
my @clearedLevels;
my @unclearedLevels;

{
    my $levels = "input\\level-ids-${style}-last-1000.txt";
    open FIN, "<$levels" or die;
    binmode FIN, ":utf8";

    while(<FIN>) {
        chomp;
        last if (m/^$/);

        m/^(.*)$/;
        my $levelId = $1;
        my $userName = $levelsUser{$levelId};

        unless (defined $userName) {
            push @unclearedLevels, $levelId;
            next;
        }
        push @clearedLevels, $levelId;

        my $num = $levelsNum{$levelId};
        unless (defined $userMinNum{$userName}) {
            $userMinNum{$userName} = $num;
        } elsif ($num < $userMinNum{$userName}) {
            $userMinNum{$userName} = $num;
        }

        $userNum{$userName}++;
    }

    close FIN;
}

my $totalNum = @clearedLevels + @unclearedLevels;
my $unclearedNum = @unclearedLevels;

{
    my $output = "output\\ranking-${style}-$totalNum.txt";
    open FOUT, ">$output" or die;
    binmode FOUT, ":utf8";

    print FOUT "Contributor ranking for last $totalNum levels of 2020 ${style}. :Toadette:\n";
    print FOUT "```\n";

    for my $userName (sort {
        my $res = $userNum{$b} <=> $userNum{$a};
        return $res if ($res != 0);
        return $userMinNum{$b} <=> $userMinNum{$a};
    } keys %userNum) {
        my $num = $userNum{$userName};
        my $minNum = $userMinNum{$userName};

        if ($userMinNum{$userName} == 0) {
            print FOUT "($userName: $num)";
        } else {
            print FOUT "$userName: $num";
        }
        # print FOUT "\t$minNum";
        print FOUT "\n";
    }

    print FOUT "```\n";
    if ($unclearedNum == 0) {
        print FOUT "Current uncleared levels: $unclearedNum :JuzHype:\n";
    } else {
        print FOUT "Current uncleared levels: $unclearedNum :PeepoCheer:\n";
    }

    close FOUT;
}

{
    my $output = "output\\uncleared-levels-${style}.txt";
    open FOUT, ">$output" or die;
    binmode FOUT, ":utf8";

    for my $levelId (@unclearedLevels) {
        print FOUT "$levelId\n";
    }

    close FOUT;
}

{
    my $output = "output\\ranking-uncleared-levels.txt";
    open FOUT, ">$output" or die;
    binmode FOUT, ":utf8";

    for my $levelId (@unclearedLevels) {
        print FOUT "$levelId\n";
    }

    close FOUT;
}


{
    my $output = "output\\ranking-cleared-levels.txt";
    open FOUT, ">$output" or die;
    binmode FOUT, ":utf8";

    for my $levelId (sort {$levelsNum{$a} <=> $levelsNum{$b}} @clearedLevels) {
        my $user = $levelsUser{$levelId};
        my $num = $levelsNum{$levelId};
        print FOUT "$levelId\t$num\t$user\n";
    }

    close FOUT;
}
