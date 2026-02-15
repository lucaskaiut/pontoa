<?php 

namespace App\Services;

use App\Mail\UserInvited;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\Translation\Exception\NotFoundResourceException;

final class InvitationService 
{
    public function create(array $data): Invitation
    {
        $data['token'] = Str::uuid();

        $invitation = Invitation::create($data);

        return $invitation;
    }

    public function update(Invitation $invitation, array $data)
    {
        $invitation->update($data);

        return $invitation;
    }

    public function delete(Invitation $invitation)
    {
        $invitation->delete();
    }

    /**
     * @return Invitation[]
     */
    public function list()
    {
        $users = Invitation::paginate();

        return $users;
    }

    public function findOrFail($id): Invitation
    {
        return Invitation::findOrFail($id);
    }

    public function dispatchInvitationEmail(Invitation $invitation)
    {
        Mail::to($invitation->email)->queue(new UserInvited($invitation));
    }

    public function register(string $token, array $data): User
    {
        $invitation = Invitation::where('token', $token)->first();

        throw_if(!$invitation, new NotFoundResourceException('Convite não encontrado'));

        $data['company_id'] = $invitation->company_id;

        $data['email'] = $invitation->email;

        $user = (new UserService())->create($data);

        $invitation->update(['accepted_at' => now()]);

        return $user;
    }
}