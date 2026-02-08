<?php

namespace App\Utilities;

final class PhoneNormalizer
{
    private static function getValidDDDs(): array
    {
        return [
            '11', '12', '13', '14', '15', '16', '17', '18', '19',
            '21', '22', '24', '27', '28',
            '31', '32', '33', '34', '35', '37', '38',
            '41', '42', '43', '44', '45', '46', '47', '48', '49',
            '51', '53', '54', '55',
            '61', '62', '63', '64', '65', '66', '67', '68', '69',
            '71', '73', '74', '75', '77', '79',
            '81', '82', '83', '84', '85', '86', '87', '88', '89',
            '91', '92', '93', '94', '95', '96', '97', '98', '99',
        ];
    }

    public static function normalize(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        if (strlen($cleaned) >= 12 && substr($cleaned, 0, 2) === '55') {
            $cleaned = substr($cleaned, 2);
        }

        $ddds = self::getValidDDDs();
        $ddd = substr($cleaned, 0, 2);
        
        if (in_array($ddd, $ddds, true)) {
            $number = substr($cleaned, 2);
            
            if (strlen($number) === 8) {
                $number = '9' . $number;
            }
            
            $cleaned = $ddd . $number;
        } elseif (strlen($cleaned) >= 10) {
            $possibleDdd = substr($cleaned, 0, 2);
            if (in_array($possibleDdd, $ddds, true)) {
                $number = substr($cleaned, 2);
                if (strlen($number) === 8) {
                    $number = '9' . $number;
                }
                $cleaned = $possibleDdd . $number;
            }
        }

        if (strlen($cleaned) > 11) {
            $cleaned = substr($cleaned, 0, 11);
        }

        return $cleaned ?: null;
    }

    public static function normalizeToString(string $phone): string
    {
        return self::normalize($phone) ?? '';
    }
}

