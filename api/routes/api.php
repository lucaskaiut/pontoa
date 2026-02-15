<?php

use App\Constants\Permissions;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerPackageController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AppointmentExecutionController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SchedulingController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WhatsAppWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::group(['middleware' => ['initialize.company', 'subscription.can-write']], function () {
    Route::post('invitations/register/{token}', [InvitationController::class, 'register'])->name('invitation.name');

    Route::post('customers/register', [CustomerController::class, 'register'])->name('customers.register');
    Route::post('customers/login', [CustomerController::class, 'login'])->name('customers.login');
    Route::post('customers/first-access/{token}', [CustomerController::class, 'firstAccess'])->name('customers.first-access');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::post('customers/context/{identifier}', [CustomerController::class, 'updateContext'])->name('customers.context.update');
    Route::get('customers/context/{identifier}', [CustomerController::class, 'getContext'])->name('customers.context.get');

    Route::get('schedules/hours', [ScheduleController::class, 'hours'])->name('schedules.hours');

    Route::get('companies/me', [CompanyController::class, 'me'])->name('companies.me');

    Route::get('services', [ServiceController::class, 'index'])->name('services.index');

    Route::get('collaborators', [UserController::class, 'collaborators'])->name('collaborators.index');

    Route::get('plans', [PlanController::class, 'index'])->name('plans.index');

    Route::get('packages/available', [PackageController::class, 'available'])->name('packages.available');

    Route::post('schedulings', [SchedulingController::class, 'store'])->name('schedulings.store');

    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');

    Route::post('reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::get('reviews/public', [ReviewController::class, 'public'])->name('reviews.public');

    Route::group(['middleware' => ['auth:sanctum']], function () {
        Route::get('reviews/my-reviews', [ReviewController::class, 'myReviews'])->name('reviews.my-reviews');
    });

    Route::post('payments/token', [PaymentController::class, 'createToken'])->name('payments.createToken');

    Route::post('cart/items', [OrderController::class, 'addItemToCart'])->name('cart.items.add');
    Route::get('cart', [OrderController::class, 'getCart'])->name('cart.get');

    Route::group(['middleware' => ['auth:sanctum']], function () {
        Route::put('cart/items/{orderItemId}', [OrderController::class, 'updateCartItem'])->name('cart.items.update');
        Route::delete('cart/items/{orderItemId}', [OrderController::class, 'removeItemFromCart'])->name('cart.items.remove');
        Route::delete('cart', [OrderController::class, 'clearCart'])->name('cart.clear');
        Route::post('cart/checkout', [OrderController::class, 'checkout'])->name('cart.checkout');
        Route::put('orders/{order}/payment-method', [OrderController::class, 'updatePaymentMethod'])->name('orders.payment-method.update');
        Route::get('orders/my-orders', [OrderController::class, 'listMyOrders'])->name('orders.my-orders');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    });

    Route::group(['middleware' => ['auth:sanctum']], function () {
        Route::group(['prefix' => 'companies'], function () {
            Route::get('/', [CompanyController::class, 'index'])->name('companies.index');
            Route::post('/', [CompanyController::class, 'store'])->name('companies.store');
            Route::get('/{company}', [CompanyController::class, 'show'])->name('companies.show');
            Route::get('recurrencies', [CompanyController::class, 'recurrencies'])->name('companies.currencies.index');
            Route::post('configure-whatsapp', [CompanyController::class, 'configureWhatsApp'])->name('companies.configure-whatsapp');
            Route::get('whatsapp-qrcode', [CompanyController::class, 'getWhatsAppQrCode'])->name('companies.whatsapp-qrcode');
            Route::get('whatsapp-connection-status', [CompanyController::class, 'getWhatsAppConnectionStatus'])->name('companies.whatsapp-connection-status');
            Route::post('complete-onboarding', [CompanyController::class, 'completeOnboarding'])->name('companies.complete-onboarding');
            Route::post('calculate-plan-change', [CompanyController::class, 'calculatePlanChange'])->name('companies.calculate-plan-change');
            Route::post('change-plan', [CompanyController::class, 'changePlan'])->name('companies.change-plan');
            Route::post('update-credit-card', [CompanyController::class, 'updateCreditCard'])->name('companies.update-credit-card');
            Route::post('cancel-subscription', [CompanyController::class, 'cancelSubscription'])->name('companies.cancel-subscription');
            Route::post('reactivate-subscription', [CompanyController::class, 'reactivateSubscription'])->name('companies.reactivate-subscription');
            Route::post('set-active-card', [CompanyController::class, 'setActiveCard'])->name('companies.set-active-card');
            Route::get('cards', [CompanyController::class, 'cards'])->name('companies.cards.index');
            Route::put('/{company}', [CompanyController::class, 'update'])->name('companies.update');
            Route::post('/{company}/update-free-period', [CompanyController::class, 'updateFreePeriod'])->name('companies.update-free-period');
        });

        Route::resource('schedules', ScheduleController::class);

        Route::resource('schedulings', SchedulingController::class)->except(['store']);
        Route::post('schedulings/cancel', function (Request $request) {
            $scheduling = \App\Models\Scheduling::findOrFail($request->scheduling_id);
            $controller = app(SchedulingController::class);

            return $controller->cancel($scheduling);
        })->name('schedulings.cancellation');
        Route::patch('schedulings', function (Request $request) {
            $scheduling = \App\Models\Scheduling::findOrFail($request->scheduling_id);
            $controller = app(SchedulingController::class);

            return $controller->update($request, $scheduling);
        })->name('schedulings.update.patch');
        Route::post('schedulings/{scheduling}/cancel', [SchedulingController::class, 'cancel'])->name('schedulings.cancel');
        Route::post('schedulings/{scheduling}/confirm', [SchedulingController::class, 'confirm'])->name('schedulings.confirm');
        Route::post('schedulings/{scheduling}/no-show', [SchedulingController::class, 'noShow'])->name('schedulings.no-show');

        Route::post('schedulings/{scheduling}/check-in', [AppointmentExecutionController::class, 'checkIn'])->name('schedulings.check-in');
        Route::post('schedulings/{scheduling}/check-out', [AppointmentExecutionController::class, 'checkOut'])->name('schedulings.check-out');
        Route::get('schedulings/{scheduling}/execution', [AppointmentExecutionController::class, 'show'])->name('schedulings.execution.show');

        Route::resource('services', ServiceController::class)->except(['index']);

        Route::resource('invitations', InvitationController::class);

        Route::post('customers/me', [CustomerController::class, 'me'])->name('customers.me');
        Route::get('customers/me/packages', [CustomerPackageController::class, 'myPackages'])->name('customers.me.packages');
        Route::put('customers/{customer}/notes', [CustomerController::class, 'updateNotes'])->name('customers.notes.update');
        Route::resource('customers', CustomerController::class)->except(['update']);

        Route::post('users/me', [UserController::class, 'me'])->name('users.me');
        Route::put('users/{user}/bank', [UserController::class, 'bank'])->name('users.bank');
        Route::resource('users', UserController::class);

        Route::resource('files', FileController::class);
        Route::resource('notifications', NotificationController::class);

        Route::resource('reviews', ReviewController::class)->except(['store']);

        Route::post('settings', [SettingController::class, 'store'])->name('settings.store');

        Route::get('report/{type}', [ReportController::class, 'show'])->name('report.show');

        Route::get('permissions', function () {
            $permissions = Permissions::all();
            $labels = Permissions::labels();

            return response()->json([
                'permissions' => array_map(function ($permission) use ($labels) {
                    return [
                        'name' => $permission,
                        'label' => $labels[$permission] ?? $permission,
                    ];
                }, $permissions),
            ]);
        })->name('permissions.index');

        Route::resource('roles', RoleController::class);

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

        Route::resource('packages', PackageController::class);
        Route::post('packages/{package}/toggle-active', [PackageController::class, 'toggleActive'])->name('packages.toggle-active');

        Route::get('customers/{customer}/packages', [CustomerPackageController::class, 'index'])->name('customers.packages.index');
        Route::post('customers/{customer}/packages/{package}/activate', [CustomerPackageController::class, 'activate'])->name('customers.packages.activate');
        Route::get('customers/{customer}/packages/{customerPackage}/usages', [CustomerPackageController::class, 'usages'])->name('customers.packages.usages');
    });

});

Route::post('users/register', [UserController::class, 'register'])->name('users.register');
Route::post('users/login', [UserController::class, 'login'])->name('users.login');

Route::post('webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle'])->name('webhooks.whatsapp');

Route::get('payment_method', function () {
    $settings = json_decode(config('app.payment_method', '{}'), true);

    return response()->json([
        'active' => $settings['active'],
        'settings' => $settings['public'] ?? null,
    ]);
});
