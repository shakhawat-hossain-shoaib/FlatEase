<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome', [
            'name' => "CSE 3100",
            'group' => "A1",
        ]);
    }

}
